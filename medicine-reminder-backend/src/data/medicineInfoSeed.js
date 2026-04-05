const coreMedicineInfoSeed = [
  {
    name: 'Paracetamol',
    category: 'Painkiller / Antipyretic',
    purpose: 'Relieves fever and mild to moderate pain',
    uses: ['Fever reduction', 'Headache relief', 'Body pain and mild joint pain'],
    precautions: ['Avoid exceeding 4g/day in adults', 'Use cautiously in liver disease'],
    sideEffects: ['Nausea (rare)', 'Allergic rash (rare)'],
    lifespan: 'Store below 25 C in a dry place. Typical shelf life is 2-3 years.',
  },
  {
    name: 'Ibuprofen',
    category: 'NSAID',
    purpose: 'Reduces pain, fever, and inflammation',
    uses: ['Muscle pain', 'Dental pain', 'Menstrual cramps', 'Inflammatory pain'],
    precautions: ['Take with food', 'Avoid in active gastric ulcer', 'Use cautiously in kidney disease'],
    sideEffects: ['Stomach upset', 'Heartburn', 'Dizziness'],
    lifespan: 'Store at room temperature away from moisture. Shelf life is usually 2-3 years.',
  },
  {
    name: 'Aspirin',
    category: 'NSAID / Antiplatelet',
    purpose: 'Pain relief and prevention of blood clots in selected patients',
    uses: ['Mild pain and fever', 'Secondary prevention of heart attack/stroke'],
    precautions: ['Avoid in children with viral illness', 'Higher bleeding risk', 'Caution with ulcers'],
    sideEffects: ['Gastric irritation', 'Bleeding tendency', 'Nausea'],
    lifespan: 'Keep tightly closed in a dry container. Typical shelf life is about 2 years.',
  },
  {
    name: 'Amoxicillin',
    category: 'Antibiotic (Penicillin)',
    purpose: 'Treats susceptible bacterial infections',
    uses: ['Respiratory tract infections', 'Ear and throat infections', 'Urinary infections'],
    precautions: ['Not effective for viral infections', 'Complete the full prescribed course', 'Check penicillin allergy'],
    sideEffects: ['Diarrhea', 'Nausea', 'Skin rash'],
    lifespan: 'Capsules/tablets: room temperature. Reconstituted suspension: refrigerate and use within 7-14 days.',
  },
  {
    name: 'Azithromycin',
    category: 'Antibiotic (Macrolide)',
    purpose: 'Treats bacterial respiratory and skin infections',
    uses: ['Bronchitis', 'Sinusitis', 'Skin infections'],
    precautions: ['Use only when prescribed', 'May affect heart rhythm in at-risk patients'],
    sideEffects: ['Loose stools', 'Abdominal pain', 'Nausea'],
    lifespan: 'Store tablets at room temperature. Suspension shelf life depends on product label (usually around 5-10 days after mixing).',
  },
  {
    name: 'Ciprofloxacin',
    category: 'Antibiotic (Fluoroquinolone)',
    purpose: 'Treats selected serious bacterial infections',
    uses: ['Urinary tract infections', 'Gastrointestinal infections', 'Certain skin infections'],
    precautions: ['Avoid unnecessary use', 'Risk of tendon injury', 'Avoid with dairy-only dose intake timing conflicts'],
    sideEffects: ['Nausea', 'Diarrhea', 'Headache'],
    lifespan: 'Store at room temperature in original container. Shelf life is generally 2-3 years.',
  },
  {
    name: 'Metformin',
    category: 'Antidiabetic (Biguanide)',
    purpose: 'Helps control blood glucose in type 2 diabetes',
    uses: ['Type 2 diabetes management', 'Insulin resistance support in selected patients'],
    precautions: ['Take with meals', 'Monitor kidney function', 'Temporary hold before some contrast studies'],
    sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
    lifespan: 'Store below 25 C and keep dry. Typical shelf life is around 2-3 years.',
  },
  {
    name: 'Insulin Glargine',
    category: 'Antidiabetic (Long-acting insulin)',
    purpose: 'Provides long-acting blood glucose control',
    uses: ['Basal insulin for diabetes mellitus'],
    precautions: ['Do not freeze', 'Rotate injection sites', 'Monitor hypoglycemia risk'],
    sideEffects: ['Low blood sugar', 'Weight gain', 'Injection site reactions'],
    lifespan: 'Unopened pens/vials refrigerated. After opening, typically usable for about 28 days at room temperature per product guidance.',
  },
  {
    name: 'Losartan',
    category: 'Antihypertensive (ARB)',
    purpose: 'Lowers blood pressure and protects kidneys in selected patients',
    uses: ['Hypertension', 'Kidney protection in diabetic nephropathy'],
    precautions: ['Monitor kidney function and potassium', 'Avoid in pregnancy'],
    sideEffects: ['Dizziness', 'Fatigue', 'Mild increase in potassium'],
    lifespan: 'Store at room temperature away from humidity. Shelf life generally 2-3 years.',
  },
  {
    name: 'Amlodipine',
    category: 'Antihypertensive (Calcium Channel Blocker)',
    purpose: 'Controls high blood pressure and angina',
    uses: ['Hypertension', 'Chronic stable angina'],
    precautions: ['Rise slowly if dizzy', 'Monitor swelling in feet'],
    sideEffects: ['Ankle swelling', 'Flushing', 'Headache'],
    lifespan: 'Store at room temperature. Typical shelf life is around 2-3 years.',
  },
  {
    name: 'Atorvastatin',
    category: 'Lipid-lowering (Statin)',
    purpose: 'Lowers LDL cholesterol and cardiovascular risk',
    uses: ['High cholesterol', 'Cardiovascular risk reduction'],
    precautions: ['Monitor liver function if clinically indicated', 'Report unexplained muscle pain'],
    sideEffects: ['Muscle aches', 'Mild digestive upset'],
    lifespan: 'Store in original container at room temperature. Shelf life usually 2-3 years.',
  },
  {
    name: 'Rosuvastatin',
    category: 'Lipid-lowering (Statin)',
    purpose: 'Reduces cholesterol and cardiovascular risk',
    uses: ['Hyperlipidemia', 'Primary prevention in selected patients'],
    precautions: ['Avoid in pregnancy', 'Report severe muscle symptoms'],
    sideEffects: ['Headache', 'Muscle pain', 'Nausea'],
    lifespan: 'Store below 30 C, away from moisture. Typical shelf life is around 2-3 years.',
  },
  {
    name: 'Omeprazole',
    category: 'Proton Pump Inhibitor',
    purpose: 'Reduces stomach acid production',
    uses: ['GERD', 'Peptic ulcer disease', 'Acid reflux symptoms'],
    precautions: ['Best taken before meals', 'Long-term use should be reviewed by clinician'],
    sideEffects: ['Headache', 'Abdominal discomfort', 'Nausea'],
    lifespan: 'Store at room temperature and keep dry. Typical shelf life is 2-3 years.',
  },
  {
    name: 'Pantoprazole',
    category: 'Proton Pump Inhibitor',
    purpose: 'Treats acid-related stomach conditions',
    uses: ['GERD', 'Erosive esophagitis', 'Acid peptic symptoms'],
    precautions: ['Use shortest effective duration', 'Clinical review for chronic symptoms'],
    sideEffects: ['Headache', 'Diarrhea', 'Nausea'],
    lifespan: 'Store below 25-30 C based on brand. Shelf life usually 2 years or more.',
  },
  {
    name: 'Cetirizine',
    category: 'Antihistamine',
    purpose: 'Relieves allergy symptoms',
    uses: ['Allergic rhinitis', 'Urticaria and itching'],
    precautions: ['May cause drowsiness in some people', 'Use caution when driving initially'],
    sideEffects: ['Sleepiness', 'Dry mouth', 'Fatigue'],
    lifespan: 'Store at room temperature in a dry area. Typical shelf life is around 2 years.',
  },
  {
    name: 'Loratadine',
    category: 'Antihistamine',
    purpose: 'Relieves allergic symptoms with low sedation risk',
    uses: ['Seasonal allergy', 'Sneezing and runny nose', 'Itchy skin allergy'],
    precautions: ['Dose adjust in severe liver impairment'],
    sideEffects: ['Headache', 'Dry mouth', 'Mild fatigue'],
    lifespan: 'Keep at room temperature and dry. Shelf life commonly 2-3 years.',
  },
  {
    name: 'Salbutamol',
    category: 'Bronchodilator',
    purpose: 'Relieves acute bronchospasm',
    uses: ['Asthma symptom relief', 'Wheezing and breathlessness episodes'],
    precautions: ['Do not exceed prescribed puffs', 'Seek review if frequent use needed'],
    sideEffects: ['Tremor', 'Palpitations', 'Nervousness'],
    lifespan: 'Inhalers at room temperature away from heat. Follow canister expiry date.',
  },
  {
    name: 'Budesonide',
    category: 'Inhaled Corticosteroid',
    purpose: 'Prevents airway inflammation in asthma',
    uses: ['Asthma control therapy'],
    precautions: ['Rinse mouth after inhalation', 'Not for immediate relief attacks'],
    sideEffects: ['Oral thrush', 'Hoarseness', 'Cough'],
    lifespan: 'Store inhaler/device per label at room temperature. Use before printed expiry.',
  },
  {
    name: 'Levothyroxine',
    category: 'Thyroid Hormone',
    purpose: 'Replaces deficient thyroid hormone',
    uses: ['Hypothyroidism treatment'],
    precautions: ['Take on empty stomach at consistent time', 'Avoid abrupt brand switching without advice'],
    sideEffects: ['If overdosed: palpitations, tremor, anxiety'],
    lifespan: 'Store away from light and moisture. Typical shelf life 1-2 years by brand.',
  },
  {
    name: 'Prednisolone',
    category: 'Corticosteroid',
    purpose: 'Reduces inflammation and immune activity',
    uses: ['Allergic conditions', 'Autoimmune flare management', 'Inflammatory disorders'],
    precautions: ['Do not stop abruptly after long-term use', 'Take with food'],
    sideEffects: ['Increased appetite', 'Mood changes', 'Raised blood sugar'],
    lifespan: 'Store at room temperature and protect from moisture. Shelf life often around 2-3 years.',
  },
  {
    name: 'Diclofenac',
    category: 'NSAID',
    purpose: 'Treats pain and inflammation',
    uses: ['Musculoskeletal pain', 'Arthritis pain', 'Post-injury inflammation'],
    precautions: ['Use lowest effective dose', 'Caution in kidney disease and ulcers'],
    sideEffects: ['Gastric irritation', 'Nausea', 'Headache'],
    lifespan: 'Store at room temperature. Topical forms should be tightly capped after use.',
  },
  {
    name: 'Tramadol',
    category: 'Analgesic (Opioid-like)',
    purpose: 'Moderate pain relief',
    uses: ['Moderate pain not controlled by simple analgesics'],
    precautions: ['May cause drowsiness', 'Risk of dependence with prolonged use', 'Avoid alcohol'],
    sideEffects: ['Nausea', 'Dizziness', 'Constipation'],
    lifespan: 'Store securely at room temperature away from children. Follow printed expiry.',
  },
  {
    name: 'Ondansetron',
    category: 'Antiemetic',
    purpose: 'Prevents nausea and vomiting',
    uses: ['Post-operative nausea', 'Medication-induced nausea'],
    precautions: ['May affect heart rhythm in susceptible patients'],
    sideEffects: ['Headache', 'Constipation', 'Dizziness'],
    lifespan: 'Store at room temperature. Shelf life commonly around 2 years.',
  },
  {
    name: 'Domperidone',
    category: 'Prokinetic / Antiemetic',
    purpose: 'Relieves nausea and improves gastric motility',
    uses: ['Nausea', 'Bloating due to delayed gastric emptying'],
    precautions: ['Use only as advised', 'Cardiac risk in high-risk populations'],
    sideEffects: ['Dry mouth', 'Abdominal cramps', 'Headache'],
    lifespan: 'Keep at room temperature and dry. Typical shelf life 2-3 years.',
  },
  {
    name: 'Doxycycline',
    category: 'Antibiotic (Tetracycline)',
    purpose: 'Treats a broad range of bacterial infections',
    uses: ['Respiratory and skin infections', 'Acne in selected cases'],
    precautions: ['Take with full glass of water', 'Avoid lying down immediately after dose', 'Photosensitivity risk'],
    sideEffects: ['Nausea', 'Photosensitivity', 'Esophageal irritation'],
    lifespan: 'Store at room temperature in original container. Discard expired tetracyclines safely.',
  },
  {
    name: 'Co-trimoxazole',
    category: 'Antibiotic Combination',
    purpose: 'Treats selected bacterial infections',
    uses: ['Urinary tract infection', 'Respiratory infections', 'Certain opportunistic infections'],
    precautions: ['Hydrate well', 'Check sulfa allergy'],
    sideEffects: ['Rash', 'Nausea', 'Loss of appetite'],
    lifespan: 'Store below 25 C and keep dry. Typical shelf life 2-3 years.',
  },
  {
    name: 'Clopidogrel',
    category: 'Antiplatelet',
    purpose: 'Prevents clot-related cardiovascular events',
    uses: ['Post-stent therapy', 'Stroke and heart attack prevention in selected patients'],
    precautions: ['Bleeding risk', 'Inform clinicians before surgery'],
    sideEffects: ['Easy bruising', 'Nosebleeds', 'Indigestion'],
    lifespan: 'Store in dry conditions at room temperature. Shelf life generally 2-3 years.',
  },
  {
    name: 'Warfarin',
    category: 'Anticoagulant',
    purpose: 'Prevents and treats blood clots',
    uses: ['Atrial fibrillation stroke prevention', 'DVT/PE management'],
    precautions: ['Requires INR monitoring', 'Many food and drug interactions'],
    sideEffects: ['Bleeding', 'Bruising'],
    lifespan: 'Store tightly closed at room temperature. Follow expiry and monitor tablet strength carefully.',
  },
  {
    name: 'Apixaban',
    category: 'Anticoagulant (DOAC)',
    purpose: 'Prevents stroke and treats blood clots',
    uses: ['Atrial fibrillation stroke prevention', 'DVT/PE treatment and prevention'],
    precautions: ['Bleeding risk', 'Do not miss doses frequently'],
    sideEffects: ['Bleeding', 'Bruising', 'Nausea'],
    lifespan: 'Store at room temperature in original packaging. Typical shelf life around 2-3 years.',
  },
  {
    name: 'Calcium + Vitamin D',
    category: 'Supplement',
    purpose: 'Supports bone health',
    uses: ['Osteoporosis prevention and support', 'Calcium deficiency'],
    precautions: ['Avoid excess doses', 'Use carefully with kidney stone history'],
    sideEffects: ['Constipation', 'Bloating'],
    lifespan: 'Store in a cool, dry place with lid tightly closed. Shelf life commonly 2 years.',
  },
  {
    name: 'Ferrous Sulfate',
    category: 'Iron Supplement',
    purpose: 'Treats iron deficiency anemia',
    uses: ['Iron deficiency correction', 'Anemia support'],
    precautions: ['Keep away from children', 'May darken stools'],
    sideEffects: ['Constipation', 'Nausea', 'Abdominal discomfort'],
    lifespan: 'Store at room temperature and dry. Typical shelf life around 2 years.',
  },
  {
    name: 'Multivitamin',
    category: 'Supplement',
    purpose: 'Provides broad micronutrient support',
    uses: ['Nutritional supplementation in deficient diets'],
    precautions: ['Do not exceed label dose', 'Avoid duplicate vitamin products'],
    sideEffects: ['Mild nausea', 'Stomach upset'],
    lifespan: 'Store in cool dry place and keep tightly sealed. Check label expiry date.',
  },
  {
    name: 'Oral Rehydration Salts',
    category: 'Rehydration Therapy',
    purpose: 'Replaces fluids and electrolytes',
    uses: ['Dehydration from diarrhea or vomiting'],
    precautions: ['Use prepared solution within recommended hours', 'Follow mixing instructions exactly'],
    sideEffects: ['Usually well tolerated', 'Rare bloating'],
    lifespan: 'Unopened sachets: room temperature and dry. Prepared solution: use within 12-24 hours depending on storage.',
  },
];

const supplementalGroups = [
  {
    category: 'Antibiotic',
    purpose: 'Treats bacterial infections',
    names: [
      'Cephalexin', 'Cefuroxime', 'Cefixime', 'Ceftriaxone', 'Levofloxacin', 'Moxifloxacin', 'Clarithromycin',
      'Erythromycin', 'Linezolid', 'Meropenem', 'Imipenem', 'Amoxicillin-Clavulanate', 'Clindamycin',
      'Rifampicin', 'Nitrofurantoin', 'Fosfomycin', 'Vancomycin', 'Metronidazole', 'Tinidazole', 'Ofloxacin',
    ],
  },
  {
    category: 'Antihypertensive',
    purpose: 'Helps control high blood pressure',
    names: [
      'Telmisartan', 'Valsartan', 'Olmesartan', 'Irbesartan', 'Candesartan', 'Enalapril', 'Ramipril', 'Lisinopril',
      'Perindopril', 'Hydrochlorothiazide', 'Chlorthalidone', 'Metoprolol', 'Bisoprolol', 'Nebivolol', 'Carvedilol',
      'Nifedipine', 'Diltiazem', 'Verapamil', 'Prazosin', 'Clonidine',
    ],
  },
  {
    category: 'Antidiabetic',
    purpose: 'Helps control blood sugar levels',
    names: [
      'Glimepiride', 'Gliclazide', 'Glipizide', 'Sitagliptin', 'Vildagliptin', 'Linagliptin', 'Empagliflozin',
      'Dapagliflozin', 'Canagliflozin', 'Pioglitazone', 'Acarbose', 'Repaglinide', 'Semaglutide', 'Liraglutide',
      'Insulin Aspart', 'Insulin Lispro', 'Insulin Detemir', 'Insulin Degludec',
    ],
  },
  {
    category: 'Painkiller / Anti-inflammatory',
    purpose: 'Relieves pain and inflammation',
    names: [
      'Naproxen', 'Ketorolac', 'Meloxicam', 'Etoricoxib', 'Celecoxib', 'Mefenamic Acid', 'Piroxicam',
      'Indomethacin', 'Acetaminophen-Codeine', 'Codeine', 'Morphine', 'Oxycodone', 'Hydromorphone',
      'Tapentadol', 'Buprenorphine',
    ],
  },
  {
    category: 'Gastrointestinal',
    purpose: 'Supports digestion and acid control',
    names: [
      'Esomeprazole', 'Rabeprazole', 'Lansoprazole', 'Famotidine', 'Ranitidine', 'Sucralfate', 'Simethicone',
      'Lactulose', 'Polyethylene Glycol', 'Senna', 'Bisacodyl', 'Loperamide', 'Dicyclomine', 'Hyoscine Butylbromide',
      'Pancrelipase',
    ],
  },
  {
    category: 'Respiratory / Allergy',
    purpose: 'Relieves breathing and allergy symptoms',
    names: [
      'Montelukast', 'Fexofenadine', 'Desloratadine', 'Chlorpheniramine', 'Diphenhydramine', 'Levocetirizine',
      'Theophylline', 'Tiotropium', 'Ipratropium', 'Formoterol', 'Salmeterol', 'Fluticasone', 'Mometasone',
      'Beclomethasone', 'Phenylephrine', 'Pseudoephedrine',
    ],
  },
  {
    category: 'Cardiovascular / Lipid',
    purpose: 'Supports heart and cholesterol management',
    names: [
      'Simvastatin', 'Pravastatin', 'Fenofibrate', 'Ezetimibe', 'Isosorbide Mononitrate', 'Nitroglycerin',
      'Digoxin', 'Amiodarone', 'Dronedarone', 'Furosemide', 'Spironolactone', 'Torsemide', 'Ivabradine',
      'Rivaroxaban', 'Dabigatran', 'Edoxaban',
    ],
  },
  {
    category: 'Neurology / Psychiatry',
    purpose: 'Supports neurological and mental health conditions',
    names: [
      'Gabapentin', 'Pregabalin', 'Carbamazepine', 'Valproate', 'Lamotrigine', 'Levetiracetam', 'Topiramate',
      'Amitriptyline', 'Nortriptyline', 'Sertraline', 'Escitalopram', 'Fluoxetine', 'Paroxetine', 'Venlafaxine',
      'Duloxetine', 'Quetiapine', 'Olanzapine', 'Risperidone', 'Clonazepam', 'Lorazepam', 'Diazepam',
    ],
  },
  {
    category: 'Hormonal / Endocrine',
    purpose: 'Supports hormonal regulation',
    names: [
      'Thyroxine Sodium', 'Methimazole', 'Propylthiouracil', 'Hydrocortisone', 'Dexamethasone', 'Methylprednisolone',
      'Medroxyprogesterone', 'Norethisterone', 'Estradiol', 'Progesterone Micronized',
    ],
  },
  {
    category: 'Vitamins / Supplements',
    purpose: 'Provides nutritional support',
    names: [
      'Vitamin B12', 'Folic Acid', 'Vitamin C', 'Vitamin E', 'Vitamin K2', 'Magnesium Citrate', 'Zinc Sulfate',
      'Potassium Chloride', 'Omega 3', 'Probiotic', 'Biotin', 'Coenzyme Q10', 'Calcium Carbonate',
    ],
  },
];

function createSupplementalMedicine(name, category, purpose) {
  return {
    name,
    category,
    purpose,
    uses: [purpose, `Commonly prescribed in ${category.toLowerCase()} care`],
    precautions: [
      'Use only as advised by a qualified healthcare professional',
      'Check allergy, pregnancy, and interaction risks before use',
    ],
    sideEffects: ['Mild nausea', 'Headache', 'Dizziness'],
    lifespan: 'Store at room temperature in a dry place and follow the printed expiry date.',
  };
}

const dosageGuideByMedicine = {
  paracetamol: [
    {
      ageGroup: '0-5 years',
      dose: '10-15 mg/kg per dose',
      frequency: 'Every 4-6 hours if needed',
      maxDaily: 'Maximum 60 mg/kg/day',
      notes: 'Use pediatric formulation and measuring device.',
    },
    {
      ageGroup: '6-12 years',
      dose: '10-15 mg/kg per dose',
      frequency: 'Every 4-6 hours if needed',
      maxDaily: 'Maximum 75 mg/kg/day (follow pediatric guidance)',
      notes: 'Tablet strength should match child weight and age.',
    },
    {
      ageGroup: '13-17 years',
      dose: '500 mg per dose',
      frequency: 'Every 4-6 hours if needed',
      maxDaily: 'Do not exceed 3000 mg/day unless prescribed',
      notes: 'Avoid duplicate paracetamol-containing products.',
    },
    {
      ageGroup: '18-64 years',
      dose: '500-1000 mg per dose',
      frequency: 'Every 4-6 hours if needed',
      maxDaily: 'Do not exceed 4000 mg/day',
      notes: 'Use lower limits if liver disease risk is present.',
    },
    {
      ageGroup: '65+ years',
      dose: '500 mg per dose',
      frequency: 'Every 6-8 hours if needed',
      maxDaily: 'Usually keep at or below 3000 mg/day',
      notes: 'Prefer lower effective dose and monitor liver function risk.',
    },
  ],
  ibuprofen: [
    {
      ageGroup: '0-5 years',
      dose: '5-10 mg/kg per dose',
      frequency: 'Every 6-8 hours if needed',
      maxDaily: 'Maximum 40 mg/kg/day',
      notes: 'Use pediatric formulation; avoid dehydration states.',
    },
    {
      ageGroup: '6-12 years',
      dose: '5-10 mg/kg per dose',
      frequency: 'Every 6-8 hours if needed',
      maxDaily: 'Maximum 40 mg/kg/day',
      notes: 'Give with food where possible.',
    },
    {
      ageGroup: '13-17 years',
      dose: '200-400 mg per dose',
      frequency: 'Every 6-8 hours if needed',
      maxDaily: 'Do not exceed 1200 mg/day unless prescribed',
      notes: 'Avoid if gastric ulcer history exists.',
    },
    {
      ageGroup: '18-64 years',
      dose: '200-400 mg per dose',
      frequency: 'Every 6-8 hours if needed',
      maxDaily: 'Do not exceed 1200 mg/day OTC unless prescribed',
      notes: 'Avoid in gastric ulcers and severe kidney disease.',
    },
    {
      ageGroup: '65+ years',
      dose: '200 mg per dose',
      frequency: 'Every 8 hours if needed',
      maxDaily: 'Use lowest effective dose for shortest duration',
      notes: 'Higher GI and renal risk; clinician review recommended.',
    },
  ],
  amoxicillin: [
    {
      ageGroup: '0-5 years',
      dose: '20-45 mg/kg/day (divided doses)',
      frequency: 'Every 8-12 hours per prescription',
      maxDaily: 'Per clinician and infection type',
      notes: 'Complete the full antibiotic course.',
    },
    {
      ageGroup: '6-12 years',
      dose: '20-45 mg/kg/day (divided doses)',
      frequency: 'Every 8-12 hours per prescription',
      maxDaily: 'Per clinician and infection type',
      notes: 'Dose varies by weight and infection severity.',
    },
    {
      ageGroup: '13-17 years',
      dose: '250-500 mg per dose',
      frequency: 'Every 8 hours (or as prescribed)',
      maxDaily: 'Per clinician and infection severity',
      notes: 'Complete full course.',
    },
    {
      ageGroup: '18-64 years',
      dose: '250-500 mg per dose',
      frequency: 'Every 8 hours (or as prescribed)',
      maxDaily: 'Per clinician and infection severity',
      notes: 'Dose varies by infection and renal function.',
    },
    {
      ageGroup: '65+ years',
      dose: '250-500 mg per dose',
      frequency: 'Every 8-12 hours (as prescribed)',
      maxDaily: 'Adjust by kidney function',
      notes: 'Renal dosing adjustment may be required.',
    },
  ],
  azithromycin: [
    {
      ageGroup: '0-5 years',
      dose: '10 mg/kg day 1, then 5 mg/kg days 2-5',
      frequency: 'Once daily',
      maxDaily: 'As per pediatric specialist advice',
      notes: 'Use exact pediatric suspension concentration.',
    },
    {
      ageGroup: '6-12 years',
      dose: '10 mg/kg day 1, then 5 mg/kg days 2-5',
      frequency: 'Once daily',
      maxDaily: 'As per pediatric specialist advice',
      notes: 'Use exact pediatric suspension concentration.',
    },
    {
      ageGroup: '13-17 years',
      dose: '500 mg day 1, then 250 mg days 2-5',
      frequency: 'Once daily',
      maxDaily: 'As prescribed',
      notes: 'Regimen differs by infection type.',
    },
    {
      ageGroup: '18-64 years',
      dose: '500 mg day 1, then 250 mg days 2-5',
      frequency: 'Once daily',
      maxDaily: 'As prescribed',
      notes: 'Regimen differs by infection type.',
    },
    {
      ageGroup: '65+ years',
      dose: '500 mg day 1, then 250 mg days 2-5',
      frequency: 'Once daily',
      maxDaily: 'As prescribed with interaction review',
      notes: 'Review QT-risk and interacting medicines.',
    },
  ],
  metformin: [
    {
      ageGroup: '0-5 years',
      dose: 'Not routinely used in this age band unless specialist-directed',
      frequency: 'Specialist direction only',
      maxDaily: 'Specialist-directed',
      notes: 'Pediatric endocrinology supervision required.',
    },
    {
      ageGroup: '6-12 years',
      dose: '500 mg once or twice daily (initial)',
      frequency: 'With meals',
      maxDaily: 'Up to 2000 mg/day based on clinician titration',
      notes: 'Titrate gradually to reduce GI side effects.',
    },
    {
      ageGroup: '13-17 years',
      dose: '500 mg once or twice daily (initial)',
      frequency: 'With meals',
      maxDaily: 'Up to 2000 mg/day based on clinician titration',
      notes: 'Titrate gradually to reduce GI side effects.',
    },
    {
      ageGroup: '18-64 years',
      dose: '500 mg once or twice daily (initial)',
      frequency: 'With meals',
      maxDaily: 'Usually up to 2000 mg/day (up to 2550 mg/day IR in some protocols)',
      notes: 'Dose depends on glycemic control and kidney function.',
    },
    {
      ageGroup: '65+ years',
      dose: '500 mg once daily (initial)',
      frequency: 'With meals',
      maxDaily: 'Titrate cautiously based on kidney function',
      notes: 'Monitor renal function closely in older adults.',
    },
  ],
};

function getDefaultDosageByAge(category) {
  const normalized = String(category || '').toLowerCase();

  if (normalized.includes('antibiotic')) {
    return [
      {
        ageGroup: '0-5 years',
        dose: '10-20 mg/kg per dose',
        frequency: 'Every 8-12 hours (as prescribed)',
        maxDaily: 'Depends on medicine and infection',
        notes: 'Pediatric dose must be weight-based and clinician-approved.',
      },
      {
        ageGroup: '6-12 years',
        dose: '10-20 mg/kg per dose',
        frequency: 'Every 8-12 hours (as prescribed)',
        maxDaily: 'Depends on medicine and infection',
        notes: 'Use pediatric formulation and complete full course.',
      },
      {
        ageGroup: '13-17 years',
        dose: '250-500 mg per dose',
        frequency: 'Every 8-12 hours (as prescribed)',
        maxDaily: 'Depends on medicine and infection',
        notes: 'Antibiotic choice and dose depend on infection site.',
      },
      {
        ageGroup: '18-64 years',
        dose: '250-500 mg per dose',
        frequency: 'Every 8-12 hours (as prescribed)',
        maxDaily: 'Depends on medicine and infection',
        notes: 'Complete full course and do not self-adjust dose.',
      },
      {
        ageGroup: '65+ years',
        dose: '250-500 mg per dose',
        frequency: 'Every 8-12 hours (as prescribed)',
        maxDaily: 'May require renal adjustment',
        notes: 'Dose may need kidney-function based adjustment.',
      },
    ];
  }

  if (normalized.includes('painkiller') || normalized.includes('antipyretic') || normalized.includes('nsaid')) {
    return [
      {
        ageGroup: '0-5 years',
        dose: '5-10 mg/kg per dose',
        frequency: 'Every 6-8 hours if needed',
        maxDaily: 'Follow pediatric max mg/kg/day guidance',
        notes: 'Prefer pediatric syrup/drop formulation.',
      },
      {
        ageGroup: '6-12 years',
        dose: '10 mg/kg per dose',
        frequency: 'Every 6-8 hours if needed',
        maxDaily: 'Follow pediatric max mg/kg/day guidance',
        notes: 'Match dose to current body weight.',
      },
      {
        ageGroup: '13-17 years',
        dose: '250-500 mg per dose',
        frequency: 'Every 6-8 hours if needed',
        maxDaily: 'Per label unless clinician prescribed otherwise',
        notes: 'Do not combine multiple painkillers without advice.',
      },
      {
        ageGroup: '18-64 years',
        dose: '500 mg per dose',
        frequency: 'Every 6-8 hours if needed',
        maxDaily: 'Follow product maximum daily dose',
        notes: 'Use lowest effective dose.',
      },
      {
        ageGroup: '65+ years',
        dose: '250-500 mg per dose',
        frequency: 'Every 8 hours if needed',
        maxDaily: 'Prefer lower maximum daily dose',
        notes: 'Higher GI/renal risk, review co-morbidities.',
      },
    ];
  }

  return [
    {
      ageGroup: '0-5 years',
      dose: 'Use pediatric/weight-based dosing',
      frequency: 'As advised by clinician',
      maxDaily: 'Follow pediatric guidance',
      notes: 'Do not use adult mg doses directly in children.',
    },
    {
      ageGroup: '6-12 years',
      dose: 'Use pediatric/weight-based dosing',
      frequency: 'As advised by clinician',
      maxDaily: 'Follow pediatric guidance',
      notes: 'Match dose to child weight and formulation strength.',
    },
    {
      ageGroup: '13-17 years',
      dose: 'Use label or prescribed dose',
      frequency: 'As advised by clinician',
      maxDaily: 'Follow product and clinical guidance',
      notes: 'Use adolescent-appropriate dose; avoid self-escalation.',
    },
    {
      ageGroup: '18-64 years',
      dose: 'Use label or prescribed dose',
      frequency: 'As advised by clinician',
      maxDaily: 'Follow product and clinical guidance',
      notes: 'Dose may vary by indication and comorbidities.',
    },
    {
      ageGroup: '65+ years',
      dose: 'Use lower starting dose when appropriate',
      frequency: 'As advised by clinician',
      maxDaily: 'Follow product and clinical guidance',
      notes: 'Adjustments may be required for kidney/liver disease and interactions.',
    },
  ];
}

function attachDosageGuide(item) {
  const key = item.name.trim().toLowerCase();
  const dosageByAge = dosageGuideByMedicine[key] || getDefaultDosageByAge(item.category);
  return {
    ...item,
    dosageByAge,
  };
}

const supplementalMedicineInfoSeed = supplementalGroups.flatMap((group) =>
  group.names.map((name) => createSupplementalMedicine(name, group.category, group.purpose))
);

const seen = new Set();
const medicineInfoSeed = [...coreMedicineInfoSeed, ...supplementalMedicineInfoSeed]
  .map(attachDosageGuide)
  .filter((item) => {
  const key = item.name.trim().toLowerCase();
  if (seen.has(key)) {
    return false;
  }
  seen.add(key);
  return true;
  });

export default medicineInfoSeed;
