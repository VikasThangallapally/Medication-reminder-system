import User from '../models/User.js';

export async function saveCaregiver(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const caregiverName = String(name || '').trim();
    const caregiverEmail = String(email || '').trim().toLowerCase();
    const caregiverPhone = String(phone || '').trim();

    if (!caregiverName) {
      return res.status(400).json({ message: 'Caregiver name is required' });
    }

    if (!caregiverEmail && !caregiverPhone) {
      return res.status(400).json({ message: 'Caregiver email or phone is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        caregiver: {
          name: caregiverName,
          email: caregiverEmail,
          phone: caregiverPhone,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Caregiver saved successfully',
      caregiver: user.caregiver || null,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        caregiver: user.caregiver || null,
      },
    });
  } catch (error) {
    return next(error);
  }
}