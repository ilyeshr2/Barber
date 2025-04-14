// controllers/settingsController.js
const { AppSettings } = require('../models');

// Get all settings for admin
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await AppSettings.findAll();
    
    // Convert to an object format
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.setting_key] = setting.setting_value;
    });
    
    res.status(200).json(settingsObject);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ message: 'Error getting settings' });
  }
};

// Get public settings
exports.getPublicSettings = async (req, res) => {
  try {
    // Get only settings that should be publicly available
    const publicSettings = await AppSettings.findAll({
      where: {
        setting_key: {
          [Op.like]: 'public_%' // Only get settings starting with public_
        }
      }
    });
    
    // Convert to an object format
    const settingsObject = {};
    publicSettings.forEach(setting => {
      // Remove 'public_' prefix
      const key = setting.setting_key.replace('public_', '');
      settingsObject[key] = setting.setting_value;
    });
    
    res.status(200).json(settingsObject);
  } catch (error) {
    console.error('Error getting public settings:', error);
    res.status(500).json({ message: 'Error getting public settings' });
  }
};

// Update a setting
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'Setting key and value are required' });
    }
    
    // Find or create the setting
    let [setting, created] = await AppSettings.findOrCreate({
      where: { setting_key: key },
      defaults: { setting_value: value }
    });
    
    // Update if found
    if (!created) {
      setting.setting_value = value;
      await setting.save();
    }
    
    res.status(200).json({ key, value });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Error updating setting' });
  }
};