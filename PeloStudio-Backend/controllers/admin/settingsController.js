const { Setting } = require('../../models');

exports.getAllSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        
        // Convert array to key-value object for easier client usage
        const settingsObject = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        
        res.json(settingsObject);
    } catch (error) {
        console.error('Error in getAllSettings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        if (!key || value === undefined) {
            return res.status(400).json({ message: 'Key and value are required' });
        }

        // Find or create the setting
        let [setting] = await Setting.findOrCreate({
            where: { key },
            defaults: { value }
        });

        // If setting exists, update it
        if (setting) {
            setting.value = value;
            await setting.save();
        }

        res.json({ key: setting.key, value: setting.value });
    } catch (error) {
        console.error('Error in updateSetting:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 