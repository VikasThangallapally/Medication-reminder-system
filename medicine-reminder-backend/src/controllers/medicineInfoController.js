import MedicineInfo from '../models/MedicineInfo.js';

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeResult(item) {
  return {
    name: item.name,
    category: item.category,
    purpose: item.purpose,
    uses: item.uses || [],
    precautions: item.precautions || [],
    sideEffects: item.sideEffects || [],
    dosageByAge: item.dosageByAge || [],
    lifespan: item.lifespan || '',
  };
}

export async function searchMedicineInfo(req, res, next) {
  try {
    const query = String(req.query.q || '').trim();
    const limit = Math.min(Number(req.query.limit) || 100, 1000);

    const filter = query
      ? {
          $or: [
            { name: { $regex: escapeRegex(query), $options: 'i' } },
            { category: { $regex: escapeRegex(query), $options: 'i' } },
            { purpose: { $regex: escapeRegex(query), $options: 'i' } },
          ],
        }
      : {};

    const medicines = await MedicineInfo.find(filter)
      .select('name category purpose')
      .sort({ name: 1 })
      .limit(limit)
      .lean();

    return res.status(200).json({ medicines });
  } catch (error) {
    return next(error);
  }
}

export async function getMedicineInfoByName(req, res, next) {
  try {
    const name = String(req.params.name || '').trim();
    const medicine = await MedicineInfo.findOne({
      normalizedName: name.toLowerCase(),
    }).lean();

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine information not found' });
    }

    return res.status(200).json({ medicine: normalizeResult(medicine) });
  } catch (error) {
    return next(error);
  }
}

export async function askMedicineAssistant(req, res, next) {
  try {
    const question = String(req.body?.question || req.query.q || '').trim();
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const allMeds = await MedicineInfo.find({}).select('name category purpose uses precautions sideEffects lifespan').lean();

    const lowered = question.toLowerCase();
    const direct = allMeds.find((item) => lowered.includes(String(item.name).toLowerCase()));

    if (!direct) {
      return res.status(200).json({
        answer:
          'I could not match that medicine in the current database. You can still enter the medicine manually and consult a healthcare professional for accurate guidance.',
        found: false,
      });
    }

    const usesText = (direct.uses || []).slice(0, 2).join('; ');
    const sideEffectText = (direct.sideEffects || []).slice(0, 2).join('; ');
    const cautionText = (direct.precautions || []).slice(0, 2).join('; ');

    const answer = [
      `${direct.name} is commonly used for ${direct.purpose}.`,
      usesText ? `Key uses: ${usesText}.` : '',
      cautionText ? `Important precautions: ${cautionText}.` : '',
      sideEffectText ? `Common side effects: ${sideEffectText}.` : '',
      direct.lifespan ? `Storage: ${direct.lifespan}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return res.status(200).json({
      found: true,
      medicine: normalizeResult(direct),
      answer,
    });
  } catch (error) {
    return next(error);
  }
}
