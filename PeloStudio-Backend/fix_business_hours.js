/**
 * This script will patch the admin salonController.js file
 * to fix the business hours update functionality
 */
const fs = require('fs');
const path = require('path');

// Path to the controller file
const controllerPath = path.join(__dirname, 'controllers', 'admin', 'salonController.js');

// Check if the file exists
if (!fs.existsSync(controllerPath)) {
  console.error(`Controller file not found at: ${controllerPath}`);
  process.exit(1);
}

// Read the current file
let content = fs.readFileSync(controllerPath, 'utf8');

// Find the updateBusinessHours function
const functionRegex = /exports\.updateBusinessHours\s*=\s*async\s*\(req,\s*res\)\s*=>\s*{[\s\S]*?};/;
const match = content.match(functionRegex);

if (!match) {
  console.error('Could not find updateBusinessHours function in the file');
  process.exit(1);
}

// The fixed function code
const fixedFunction = `exports.updateBusinessHours = async (req, res) => {
    try {
        // Get business hours from request body
        const { business_hours } = req.body;
        
        // Validate business hours format
        if (!business_hours || !Array.isArray(business_hours) || business_hours.length !== 7) {
            return res.status(400).json({ 
                message: 'Invalid business hours format. Must be an array of 7 days with day_of_week, is_open, open_time, and close_time'
            });
        }
        
        // Validate each day's data
        for (const day of business_hours) {
            if (
                typeof day.day_of_week !== 'number' || 
                day.day_of_week < 0 || 
                day.day_of_week > 6 ||
                typeof day.is_open !== 'boolean' ||
                typeof day.open_time !== 'string' ||
                typeof day.close_time !== 'string'
            ) {
                return res.status(400).json({ 
                    message: 'Invalid day format. Each day must have day_of_week (0-6), is_open (boolean), open_time (string), and close_time (string)'
                });
            }
        }
        
        // Find existing salon
        const salon = await Salon.findOne();
        if (!salon) {
            return res.status(404).json({ message: 'Salon not found' });
        }
        
        // Import the BusinessHours model
        const { BusinessHours } = require('../../models');
        
        // Update business hours in the BusinessHours table
        for (const day of business_hours) {
            await BusinessHours.update(
                {
                    is_open: day.is_open,
                    open_time: day.open_time,
                    close_time: day.close_time
                },
                {
                    where: {
                        salon_id: salon.id,
                        day_of_week: day.day_of_week
                    }
                }
            );
        }
        
        // Get updated business hours
        const updatedHours = await BusinessHours.findAll({
            where: { salon_id: salon.id },
            order: [['day_of_week', 'ASC']]
        });
        
        res.status(200).json({ business_hours: updatedHours });
    } catch (error) {
        console.error('Error updating business hours:', error);
        res.status(500).json({ message: 'Server error while updating business hours' });
    }
};`;

// Replace the function in the file
const updatedContent = content.replace(functionRegex, fixedFunction);

// Write to a temporary file for safety
const backupPath = controllerPath + '.bak';
const tempPath = controllerPath + '.new';

// Create backup
fs.writeFileSync(backupPath, content);
console.log(`Backup created at: ${backupPath}`);

// Write new content to temp file
fs.writeFileSync(tempPath, updatedContent);
console.log(`New controller file created at: ${tempPath}`);

console.log('\nTo apply the fix:');
console.log(`1. Verify the changes in ${tempPath}`);
console.log(`2. Run the following commands to replace the original file:`);
console.log(`   mv "${tempPath}" "${controllerPath}"`);

console.log('\nScript completed successfully!'); 