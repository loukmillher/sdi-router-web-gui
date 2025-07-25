const express = require('express');
const router = express.Router();
const PresetService = require('../services/PresetService');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs').promises;

// GET /api/presets - List all presets with pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      tags,
      isActive,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      isActive: isActive !== undefined ? isActive === 'true' : null,
      sortBy,
      sortOrder
    };

    const result = await PresetService.getAllPresets(options);
    res.json(result);
  } catch (error) {
    console.error('Error fetching presets:', error);
    res.status(500).json({ error: 'Failed to fetch presets' });
  }
});

// GET /api/presets/categories - Get all preset categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await PresetService.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/presets/tags - Get all preset tags
router.get('/tags', async (req, res) => {
  try {
    const tags = await PresetService.getAllTags();
    res.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// GET /api/presets/:id - Get specific preset
router.get('/:id', async (req, res) => {
  try {
    const { includeHistory } = req.query;
    const preset = await PresetService.getPresetById(
      req.params.id,
      includeHistory === 'true'
    );
    res.json(preset);
  } catch (error) {
    if (error.message === 'Preset not found') {
      res.status(404).json({ error: 'Preset not found' });
    } else {
      console.error('Error fetching preset:', error);
      res.status(500).json({ error: 'Failed to fetch preset' });
    }
  }
});

// GET /api/presets/:id/history - Get preset history
router.get('/:id/history', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = await PresetService.getPresetHistory(
      req.params.id,
      parseInt(limit)
    );
    res.json({ history });
  } catch (error) {
    console.error('Error fetching preset history:', error);
    res.status(500).json({ error: 'Failed to fetch preset history' });
  }
});

// POST /api/presets - Create new preset
router.post('/', async (req, res) => {
  try {
    const validation = await PresetService.validatePreset(req.body.routing);
    
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid preset data',
        details: validation.errors
      });
    }

    const preset = await PresetService.createPreset(
      req.body,
      req.session?.userId || req.ip
    );
    
    res.status(201).json(preset);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: 'Preset name already exists' });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    } else {
      console.error('Error creating preset:', error);
      res.status(500).json({ error: 'Failed to create preset' });
    }
  }
});

// PUT /api/presets/:id - Update existing preset
router.put('/:id', async (req, res) => {
  try {
    if (req.body.routing) {
      const validation = await PresetService.validatePreset(req.body.routing);
      
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Invalid preset data',
          details: validation.errors
        });
      }
    }

    const preset = await PresetService.updatePreset(
      req.params.id,
      req.body,
      req.session?.userId || req.ip
    );
    
    res.json(preset);
  } catch (error) {
    if (error.message === 'Preset not found') {
      res.status(404).json({ error: 'Preset not found' });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: 'Preset name already exists' });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    } else {
      console.error('Error updating preset:', error);
      res.status(500).json({ error: 'Failed to update preset' });
    }
  }
});

// DELETE /api/presets/:id - Delete preset
router.delete('/:id', async (req, res) => {
  try {
    const result = await PresetService.deletePreset(
      req.params.id,
      req.session?.userId || req.ip
    );
    res.json(result);
  } catch (error) {
    if (error.message === 'Preset not found') {
      res.status(404).json({ error: 'Preset not found' });
    } else {
      console.error('Error deleting preset:', error);
      res.status(500).json({ error: 'Failed to delete preset' });
    }
  }
});

// POST /api/presets/:id/apply - Apply preset with validation
router.post('/:id/apply', async (req, res) => {
  try {
    // Get the videoHub instance from the app context
    const videoHub = req.app.get('videoHub');
    
    if (!videoHub || !videoHub.connected) {
      return res.status(503).json({ error: 'VideoHub not connected' });
    }

    const result = await PresetService.applyPreset(
      req.params.id,
      videoHub,
      req.sessionID,
      req.session?.userId || req.ip
    );
    
    res.json(result);
  } catch (error) {
    if (error.message === 'Preset not found') {
      res.status(404).json({ error: 'Preset not found' });
    } else if (error.message === 'Preset is not active') {
      res.status(403).json({ error: 'Preset is not active' });
    } else {
      console.error('Error applying preset:', error);
      res.status(500).json({ error: 'Failed to apply preset' });
    }
  }
});

// GET /api/presets/:id/export - Export preset
router.get('/:id/export', async (req, res) => {
  try {
    const exportData = await PresetService.exportPreset(req.params.id);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="preset-${exportData.name.replace(/[^a-z0-9]/gi, '_')}.json"`
    );
    
    res.json(exportData);
  } catch (error) {
    if (error.message === 'Preset not found') {
      res.status(404).json({ error: 'Preset not found' });
    } else {
      console.error('Error exporting preset:', error);
      res.status(500).json({ error: 'Failed to export preset' });
    }
  }
});

// POST /api/presets/import - Import preset
router.post('/import', upload.single('preset'), async (req, res) => {
  try {
    let presetData;
    
    if (req.file) {
      // File upload
      const fileContent = await fs.readFile(req.file.path, 'utf-8');
      presetData = JSON.parse(fileContent);
      await fs.unlink(req.file.path); // Clean up uploaded file
    } else if (req.body && req.body.preset) {
      // JSON in body
      presetData = typeof req.body.preset === 'string' 
        ? JSON.parse(req.body.preset) 
        : req.body.preset;
    } else {
      return res.status(400).json({ error: 'No preset data provided' });
    }

    const imported = await PresetService.importPreset(
      presetData,
      req.session?.userId || req.ip
    );
    
    res.status(201).json(imported);
  } catch (error) {
    console.error('Error importing preset:', error);
    res.status(400).json({
      error: 'Failed to import preset',
      details: error.message
    });
  }
});

// POST /api/presets/backup - Backup all presets
router.post('/backup', async (req, res) => {
  try {
    const backup = await PresetService.backupAllPresets();
    res.json(backup);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// POST /api/presets/restore - Restore from backup
router.post('/restore', upload.single('backup'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No backup file provided' });
    }

    const results = await PresetService.restoreFromBackup(
      req.file.path,
      req.session?.userId || req.ip
    );
    
    await fs.unlink(req.file.path); // Clean up uploaded file
    
    res.json(results);
  } catch (error) {
    console.error('Error restoring backup:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(400).json({
      error: 'Failed to restore backup',
      details: error.message
    });
  }
});

module.exports = router;