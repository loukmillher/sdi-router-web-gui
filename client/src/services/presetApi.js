const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class PresetAPI {
  async fetchPresets(options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.category) queryParams.append('category', options.category);
    if (options.tags) {
      options.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (options.isActive !== undefined) queryParams.append('isActive', options.isActive);
    if (options.sortBy) queryParams.append('sortBy', options.sortBy);
    if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);

    const response = await fetch(`${API_BASE_URL}/presets?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch presets: ${response.statusText}`);
    }

    return response.json();
  }

  async getPreset(id, includeHistory = false) {
    const url = `${API_BASE_URL}/presets/${id}${includeHistory ? '?includeHistory=true' : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Preset not found');
      }
      throw new Error(`Failed to fetch preset: ${response.statusText}`);
    }

    return response.json();
  }

  async createPreset(presetData) {
    const response = await fetch(`${API_BASE_URL}/presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(presetData),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 409) {
        throw new Error('Preset name already exists');
      }
      if (response.status === 400) {
        throw new Error(error.details ? error.details.join(', ') : error.error);
      }
      throw new Error(`Failed to create preset: ${response.statusText}`);
    }

    return response.json();
  }

  async updatePreset(id, presetData) {
    const response = await fetch(`${API_BASE_URL}/presets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(presetData),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        throw new Error('Preset not found');
      }
      if (response.status === 409) {
        throw new Error('Preset name already exists');
      }
      if (response.status === 400) {
        throw new Error(error.details ? error.details.join(', ') : error.error);
      }
      throw new Error(`Failed to update preset: ${response.statusText}`);
    }

    return response.json();
  }

  async deletePreset(id) {
    const response = await fetch(`${API_BASE_URL}/presets/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Preset not found');
      }
      throw new Error(`Failed to delete preset: ${response.statusText}`);
    }

    return response.json();
  }

  async applyPreset(id) {
    const response = await fetch(`${API_BASE_URL}/presets/${id}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        throw new Error('Preset not found');
      }
      if (response.status === 503) {
        throw new Error('VideoHub not connected');
      }
      if (response.status === 403) {
        throw new Error('Preset is not active');
      }
      throw new Error(`Failed to apply preset: ${error.error || response.statusText}`);
    }

    return response.json();
  }

  async exportPreset(id) {
    const response = await fetch(`${API_BASE_URL}/presets/${id}/export`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Preset not found');
      }
      throw new Error(`Failed to export preset: ${response.statusText}`);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `preset-${id}.json`;

    return { blob, filename };
  }

  async importPreset(file) {
    const formData = new FormData();
    formData.append('preset', file);

    const response = await fetch(`${API_BASE_URL}/presets/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to import preset');
    }

    return response.json();
  }

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/presets/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return response.json();
  }

  async getTags() {
    const response = await fetch(`${API_BASE_URL}/presets/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.statusText}`);
    }

    return response.json();
  }

  async backupPresets() {
    const response = await fetch(`${API_BASE_URL}/presets/backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to backup presets: ${response.statusText}`);
    }

    return response.json();
  }

  async restoreBackup(file) {
    const formData = new FormData();
    formData.append('backup', file);

    const response = await fetch(`${API_BASE_URL}/presets/restore`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to restore backup');
    }

    return response.json();
  }

  downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default new PresetAPI();