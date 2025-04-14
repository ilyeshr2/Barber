const { User } = require('../../models');
const bcrypt = require('bcrypt');

// Get admin profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password_hash'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, email, telephone, current_password, new_password } = req.body;
        
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        // Update basic info
        if (first_name) user.first_name = first_name;
        if (last_name) user.last_name = last_name;
        if (email) user.email = email;
        if (telephone) user.telephone = telephone;
        
        // Change password if requested
        if (current_password && new_password) {
            const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
            
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            
            const salt = await bcrypt.genSalt(10);
            user.password_hash = await bcrypt.hash(new_password, salt);
        }
        
        await user.save();
        
        // Return updated user without password
        const updatedUser = await User.findByPk(req.userId, {
            attributes: { exclude: ['password_hash'] }
        });
        
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 