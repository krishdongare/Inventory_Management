const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin)
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status
// @route   PUT /api/users/:id
// @access  Private (admin)
const updateUser = async (req, res, next) => {
  try {
    // Admin can update role and isActive only — not password
    const { role, isActive, name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive, name },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user
// @route   DELETE /api/users/:id
// @access  Private (admin)
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, updateUser, deleteUser };
