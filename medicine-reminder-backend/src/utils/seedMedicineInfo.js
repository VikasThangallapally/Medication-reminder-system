import medicineInfoSeed from '../data/medicineInfoSeed.js';
import MedicineInfo from '../models/MedicineInfo.js';

function toSeedDoc(item) {
  return {
    ...item,
    normalizedName: item.name.trim().toLowerCase(),
  };
}

export async function seedMedicineInfoIfNeeded() {
  const docs = medicineInfoSeed.map(toSeedDoc);

  const operations = docs.map((doc) => ({
    updateOne: {
      filter: { normalizedName: doc.normalizedName },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const result = await MedicineInfo.bulkWrite(operations, { ordered: false });
  const inserted = Number(result.upsertedCount || 0);
  const modified = Number(result.modifiedCount || 0);

  if (inserted > 0) {
    console.log(`Seeded ${inserted} new medicine intelligence records`);
  }

  if (modified > 0) {
    console.log(`Updated ${modified} existing medicine intelligence records`);
  }
}
