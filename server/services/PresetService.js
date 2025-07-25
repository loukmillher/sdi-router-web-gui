const { Preset, PresetHistory } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

class PresetService {
  async getAllPresets(options = {}) {
    const {
      page = 1,
      limit = 50,
      category = null,
      tags = [],
      isActive = true,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = options;

    const where = {};
    
    if (isActive !== null) {
      where.isActive = isActive;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (tags.length > 0) {
      where.tags = {
        [Op.contains]: tags
      };
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Preset.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      attributes: { exclude: ['routing'] }
    });

    return {
      presets: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async getPresetById(id, includeHistory = false) {
    const preset = await Preset.findByPk(id, {
      include: includeHistory ? [{
        model: PresetHistory,
        as: 'history',
        limit: 10,
        order: [['createdAt', 'DESC']]
      }] : []
    });

    if (!preset) {
      throw new Error('Preset not found');
    }

    return preset;
  }

  async createPreset(data, userId = null) {
    const transaction = await Preset.sequelize.transaction();

    try {
      const preset = await Preset.create({
        ...data,
        createdBy: userId,
        updatedBy: userId
      }, { transaction });

      await PresetHistory.create({
        presetId: preset.id,
        action: 'created',
        newData: preset.toJSON(),
        performedBy: userId
      }, { transaction });

      await transaction.commit();
      return preset;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updatePreset(id, data, userId = null) {
    const transaction = await Preset.sequelize.transaction();

    try {
      const preset = await Preset.findByPk(id, { transaction });
      
      if (!preset) {
        throw new Error('Preset not found');
      }

      const previousData = preset.toJSON();
      
      await preset.update({
        ...data,
        updatedBy: userId
      }, { transaction });

      await PresetHistory.create({
        presetId: preset.id,
        action: 'updated',
        previousData,
        newData: preset.toJSON(),
        performedBy: userId
      }, { transaction });

      await transaction.commit();
      return preset;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deletePreset(id, userId = null) {
    const transaction = await Preset.sequelize.transaction();

    try {
      const preset = await Preset.findByPk(id, { transaction });
      
      if (!preset) {
        throw new Error('Preset not found');
      }

      const presetData = preset.toJSON();

      await PresetHistory.create({
        presetId: preset.id,
        action: 'deleted',
        previousData: presetData,
        performedBy: userId
      }, { transaction });

      await preset.destroy({ transaction });
      await transaction.commit();
      
      return { success: true, deletedPreset: presetData };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async applyPreset(id, videoHub, sessionId = null, userId = null) {
    const transaction = await Preset.sequelize.transaction();

    try {
      const preset = await Preset.findByPk(id);
      
      if (!preset) {
        throw new Error('Preset not found');
      }

      if (!preset.isActive) {
        throw new Error('Preset is not active');
      }

      const currentRouting = videoHub.getRoutes ? videoHub.getRoutes() : {};
      
      // Apply the preset routing
      const results = [];
      for (const [output, input] of Object.entries(preset.routing)) {
        try {
          // VideoHub.setRoute expects (output, input)
          const success = videoHub.setRoute(parseInt(output), parseInt(input));
          results.push({ output, input, success });
        } catch (error) {
          results.push({ output, input, success: false, error: error.message });
        }
      }

      const allSuccessful = results.every(r => r.success);

      await PresetHistory.create({
        presetId: preset.id,
        action: 'applied',
        previousData: { routing: currentRouting },
        newData: { routing: preset.routing, results },
        performedBy: userId,
        sessionId,
        success: allSuccessful,
        errorMessage: allSuccessful ? null : 'Some routes failed to apply'
      }, { transaction });

      await transaction.commit();

      return {
        success: allSuccessful,
        preset: preset.toJSON(),
        results
      };
    } catch (error) {
      await transaction.rollback();
      
      // Log the failed application attempt
      try {
        await PresetHistory.create({
          presetId: id,
          action: 'applied',
          performedBy: userId,
          sessionId,
          success: false,
          errorMessage: error.message
        });
      } catch (logError) {
        console.error('Failed to log preset application error:', logError);
      }

      throw error;
    }
  }

  async validatePreset(routing) {
    const errors = [];
    
    if (!routing || typeof routing !== 'object' || Array.isArray(routing)) {
      errors.push('Routing must be a valid object');
      return { valid: false, errors };
    }

    for (const [input, output] of Object.entries(routing)) {
      const inputNum = parseInt(input);
      const outputNum = parseInt(output);
      
      if (isNaN(inputNum) || isNaN(outputNum)) {
        errors.push(`Invalid routing: ${input} -> ${output} (must be numbers)`);
        continue;
      }
      
      if (inputNum < 1 || inputNum > 120) {
        errors.push(`Input ${inputNum} is out of range (must be 1-120)`);
      }
      
      if (outputNum < 1 || outputNum > 120) {
        errors.push(`Output ${outputNum} is out of range (must be 1-120)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async exportPreset(id) {
    const preset = await this.getPresetById(id);
    
    const exportData = {
      name: preset.name,
      description: preset.description,
      routing: preset.routing,
      category: preset.category,
      tags: preset.tags,
      metadata: preset.metadata,
      exportedAt: new Date().toISOString(),
      version: preset.version
    };

    return exportData;
  }

  async importPreset(data, userId = null) {
    const validation = await this.validatePreset(data.routing);
    
    if (!validation.valid) {
      throw new Error(`Invalid preset data: ${validation.errors.join(', ')}`);
    }

    // Check if preset with same name exists
    const existing = await Preset.findOne({
      where: { name: data.name }
    });

    if (existing) {
      // Generate unique name
      let counter = 1;
      let newName = `${data.name}_imported`;
      while (await Preset.findOne({ where: { name: newName } })) {
        newName = `${data.name}_imported_${counter++}`;
      }
      data.name = newName;
    }

    return this.createPreset({
      name: data.name,
      description: data.description || '',
      routing: data.routing,
      category: data.category || 'imported',
      tags: data.tags || ['imported'],
      metadata: {
        ...data.metadata,
        importedAt: new Date().toISOString(),
        originalName: data.name
      }
    }, userId);
  }

  async backupAllPresets() {
    const backupDir = path.join(__dirname, '..', 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `presets-backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    const presets = await Preset.findAll();
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      count: presets.length,
      presets: presets.map(p => p.toJSON())
    };

    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));

    return {
      filename,
      filepath,
      count: presets.length,
      size: (await fs.stat(filepath)).size
    };
  }

  async restoreFromBackup(filepath, userId = null) {
    const data = JSON.parse(await fs.readFile(filepath, 'utf-8'));
    
    if (!data.version || !data.presets) {
      throw new Error('Invalid backup file format');
    }

    const results = {
      success: [],
      failed: []
    };

    for (const presetData of data.presets) {
      try {
        const imported = await this.importPreset(presetData, userId);
        results.success.push(imported.name);
      } catch (error) {
        results.failed.push({
          name: presetData.name,
          error: error.message
        });
      }
    }

    return results;
  }

  async getPresetHistory(presetId, limit = 50) {
    return PresetHistory.findAll({
      where: { presetId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  async getCategories() {
    const categories = await Preset.findAll({
      attributes: ['category'],
      group: ['category'],
      where: {
        category: {
          [Op.not]: null
        }
      }
    });

    return categories.map(c => c.category);
  }

  async getAllTags() {
    const presets = await Preset.findAll({
      attributes: ['tags'],
      where: {
        tags: {
          [Op.not]: null,
          [Op.ne]: []
        }
      }
    });

    const tagSet = new Set();
    presets.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(tag => tagSet.add(tag));
      }
    });

    return Array.from(tagSet).sort();
  }
}

module.exports = new PresetService();