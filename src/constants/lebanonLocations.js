// Lebanese governorates and their cities, used by property search/filter forms.
// Keys match the governorate values stored on property records.

export const LEBANESE_GOVERNORATES = {
  'Beirut': 'Beirut',
  'Mount Lebanon': 'Mount Lebanon',
  'North Lebanon': 'North Lebanon',
  'South Lebanon': 'South Lebanon',
  'Bekaa': 'Bekaa',
  'Nabatieh': 'Nabatieh',
  'Akkar': 'Akkar',
  'Baalbek-Hermel': 'Baalbek-Hermel'
};

export const CITIES_BY_GOVERNORATE = {
  'Beirut': [
    'Achrafieh', 'Ain El Mraiseh', 'Bachoura', 'Badaro', 'Basta', 'Bourj Hammoud',
    'Clemenceau', 'Gemmayze', 'Hamra', 'Karm El Zeitoun', 'Malla', 'Manara',
    'Mar Elias', 'Mar Mikhael', 'Mazraa', 'Medawar', 'Minet El Hosn', 'Moussaitbeh',
    'Ras Beirut', 'Rmeil', 'Saifi', 'Sanayeh', 'Sodeco', 'Tabaris', 'Zoqaq El Blat'
  ],
  'Mount Lebanon': [
    'Aley', 'Antelias', 'Baabda', 'Beit Mery', 'Bikfaya', 'Broummana', 'Dbayeh',
    'Dora', 'Fanar', 'Hazmieh', 'Jal El Dib', 'Jamhour', 'Jbeil', 'Jounieh',
    'Kaslik', 'Mansourieh', 'Metn', 'Naccache', 'Rabieh', 'Roumieh', 'Sin El Fil',
    'Zouk Mikael', 'Zouk Mosbeh'
  ],
  'North Lebanon': [
    'Amioun', 'Batroun', 'Bcharreh', 'Chekka', 'Ehden', 'Enfeh', 'Halba', 'Koura',
    'Minieh', 'Tripoli', 'Zgharta'
  ],
  'South Lebanon': [
    'Jezzine', 'Maghdouche', 'Saida', 'Tyre'
  ],
  'Bekaa': [
    'Aanjar', 'Baalbek', 'Chtaura', 'Hermel', 'Jib Jannine', 'Joub Jannine',
    'Kefraya', 'Qab Elias', 'Rashaya', 'Zahle'
  ],
  'Nabatieh': [
    'Bent Jbeil', 'Hasbaya', 'Marjeyoun', 'Nabatieh'
  ],
  'Akkar': [
    'Akkar', 'Halba', 'Qoubaiyat'
  ],
  'Baalbek-Hermel': [
    'Baalbek', 'Hermel'
  ]
};

export const LEBANON_LOCATIONS = Object.entries(CITIES_BY_GOVERNORATE).map(([governorate, cities]) => ({
  governorate,
  cities
}));

// Backward-compatible alias: the canonical city map is CITIES_BY_GOVERNORATE.
export const lebanonCities = CITIES_BY_GOVERNORATE;

// Single Source of Truth for villages, keyed by city name.
export const VILLAGES_BY_CITY = {
  // Beirut
  "Achrafieh": ["Sassine", "Sioufi", "Abdel Wahab", "Furn El Hayek", "Sodeco", "Hotel Dieu", "Sursock", "Fassouh", "Rmeil", "Gémayzé", "Monot", "Ghabi", "Mar Mitr", "Adlieh", "Nasra"],
  "Hamra": ["Bliss", "Ain El Mreisseh", "Hamra Street", "Manara", "Verdun", "Ras Beirut", "Qoreitem", "Sadat", "Kantari", "Caracas", "Saroulla", "Makdessi"],
  "Gemmayze": ["Mar Mikhael", "Armenia Street", "Pasteur", "Saint Nicolas", "Rue Gouraud", "Geitawi", "Huvelin", "Mustafa Kemal", "Saifi Village", "Port District"],
  "Ras Beirut": ["Manara", "Raouche", "Ain el-Mreisseh", "Tallet el-Khayat", "Koraytem", "Jounblat", "Clemenceau", "Hamra", "Bliss", "Rawche"],
  "Mar Mikhael": ["Armenia Street", "Charles Helou", "Port Area", "Nahr", "Electricité du Liban", "Comerical District", "Rmeil", "Qobayat", "Jisr"],
  "Bourj Hammoud": ["Dora", "Naba'a", "Sin el Fil", "Armenian Quarter", "Mar Doumet", "Ghilan", "Nahr Beirut", "Khalil Badawi", "Sader"],
  "Mazraa": ["Unesco", "Cola", "Tariq el Jdideh", "Bir Hassan", "Sabra", "Horch Tabet", "Chatila", "Hay El Lija", "Ali Ibn Abi Taleb", "Garden District"],

  // Mount Lebanon
  "Jounieh": ["Sarba", "Kaslik", "Ghadir", "Haret Sakhr", "Sahel Alma", "Maameltein", "Zouk Mosbeh", "Tabarja", "Adma", "Ghazir", "Daraaoun", "Kfar Yassine", "Ain El Rihaneh"],
  "Broummana": ["Beit Mery", "Baabdat", "Monteverde", "Bhersaf", "Kornet Chahwan", "Ain Saade", "Roumieh", "Bsalim", "Qornet El Hamra", "Mazraat Yachouh"],
  "Jbeil": ["Blat", "Fidar", "Hboub", "Qartaboun", "Amchit", "Ghazir", "Old Souk", "Mastita", "Hosrayel", "Edde", "Berbara", "Halat", "Byblos Port"],
  "Antelias": ["Naccache", "Dbayeh", "Rabieh", "New Rawda", "Mezher", "Bsalim", "Biakout", "Ain Najm", "Mar Elias", "Fanar"],
  "Sin El Fil": ["Horsh Tabet", "Jisr el Wati", "Dekwaneh", "New Mar Mikhael", "Hayek", "Qalaa", "Blat", "Jisr El Bacha", "Mirna Chalouhi"],
  "Hazmieh": ["Mar Takla", "Baabda Highway", "Mar Roukoz", "Hadath", "Baabda", "Furn El Chebbak", "New Highway", "Saydet El Hazmieh"],
  "Aley": ["Aley", "Bhamdoun", "Souk El Gharb", "Bchamoun", "Aramoun", "Choueifat", "Kayfoun", "Charoun", "Ain el Remmaneh", "Btekhnay", "Bdadoun"],
  "Baabda": ["Hadath", "Hazmieh", "Yarze", "Louaize", "Baabda Village", "Hammana", "Falougha", "Qobbayaa", "Wadi Chahrour", "Jamhour"],
  "Bikfaya": ["Bhersaf", "Sakiet el Misk", "Ain el Qabou", "Mhaydseh", "Kandoul", "Sannine", "Douar", "Naas", "Mar Moussa", "Baskinta"],
  "Mansourieh": ["Ain Saadeh", "Daychounieh", "Mkalles", "Mountazah", "Ain Najm", "Roumieh", "Hazmieh", "Bmaryam", "Fanar"],
  "Metn": ["Jdeideh", "Bouchrieh", "Sad el Bauchrieh", "Zalka", "Roumie", "Dekwaneh", "Fanar", "Ain Saade", "Bsalim", "Sin el Fil", "Baouchriye"],
  "Zouk Mikael": ["Zouk Mosbeh", "Adonis", "Kaslik", "Jeita", "Shaile", "Nahr el Kalb", "Haret Sakher", "Ajaltoun", "Ghosta", "Daroun"],

  // North Lebanon
  "Tripoli": ["Mina", "Dam w Farez", "Tell", "Qalamoun", "Abou Samra", "Zahrieh", "Old Souk", "Qobbe", "Bab El Ramel", "Jabal Mohsen", "Bab El Tabbaneh"],
  "Batroun": ["Kfar Abida", "Thoum", "Rachkida", "Chekka", "Koura", "Tannourine", "Douma", "Assia", "Kfifane", "Sghar", "Hamat"],
  "Zgharta": ["Ehden", "Kfar Zeina", "Toula", "Rachiine", "Mejdlaya", "Kfar Sghab", "Ardeh", "Bchennata", "Karmsaddeh"],
  "Bcharreh": ["Hasroun", "Bazaoun", "Hadath El Jebbeh", "Hadchit", "Bqaa Kafra", "Blaouza", "Qnat", "Dimane", "Bqorqacha"],
  "Amioun": ["Kfar Hazir", "Kfar Aaqqa", "Btourram", "Darbechtar", "Bterram", "Fih", "Barsa", "Bdebba", "Ras Maska", "Kousba"],
  "Chekka": ["Hamat", "Badbhoun", "El Heri", "Kfar Hazir", "Anfeh", "Zakroun", "Bednayel", "Kfar Saroun", "Kfar Yachit"],
  "Ehden": ["Bneshaai", "Bqerqasha", "Aslout", "Bqaa Kafra", "Kfarsghab", "Tourza", "Qarn", "Mazraat El Nahr", "Sereel"],
  "Enfeh": ["Zakroun", "Dar Beechtar", "Btouratij", "Kfar Hazir", "Barghoun", "Dahr El Ain", "Terza", "El Qalamoun"],
  "Minieh": ["Beddawi", "Deir Ammar", "Bhannine", "Nabi Youchaa", "Borj El Yahoudiyeh", "Markabta", "Bqaa Safrin"],
  "Koura": ["Amioun", "Kfaraakka", "Anjaa", "Kfar Hazir", "Ras Maska", "Darbechtar", "Bterram", "Kousba", "Bdebba"],

  // South Lebanon
  "Saida": ["Abra", "Majdalyoun", "Haret Saida", "Dekerman", "Ein el Delb", "Miye ou Miye", "Darb el Sim", "Hlaliyeh", "Villat", "Bramieh"],
  "Tyre": ["Abbassieh", "Ain Baal", "Borj El Chamali", "Maaroub", "Qana", "Burj Rahal", "Deir Qanoun", "Srifa", "Mansouri", "Naqoura"],
  "Jezzine": ["Lebaa", "Roum", "Kfar Houne", "Kfar Falous", "Aaray", "Bkassine", "Machmouche", "Qaitouleh", "Mharbiyeh"],
  "Maghdouche": ["Aanqoun", "Darb el Sim", "Ghaziyeh", "Maamarieh", "Saida", "Haret Saida", "Kfarfalouss", "Loubieh"],

  // Bekaa
  "Zahle": ["Qaa Rim", "Karak", "Ksara", "Ablah", "Wadi el Arayesh", "Haouch el Omara", "Saadnayel", "Jdita", "Taanayel", "Taalabaya", "Ferzol"],
  "Baalbek": ["Douris", "Iaat", "Chmistar", "Sheikh Abdallah", "Nabi Sheet", "Hadath", "Brital", "Temnin", "Younin", "Deir el Ahmar"],
  "Chtaura": ["Taanayel", "Jdita", "Taalabaya", "Saadnayel", "Qab Elias", "Bar Elias", "Mreijat", "Maksi", "Hawsh El Ghanam"],
  "Aanjar": ["Majdal Aanjar", "Bar Elias", "Marj", "Jdita", "Taalabaya", "Qabb Elias", "Saadnayel", "Jlala"],
  "Hermel": ["Qasr", "Fisan", "Kwakh", "Zighrine", "Qasr El Hermel", "Jouar el Hachich", "Brisa", "Jabal Hermel"],
  "Jib Jannine": ["Khirbet Qanafar", "Kefraya", "Lala", "Saghbine", "Machghara", "Sultan Yacoub", "Baaloul", "Kamed el Laouz"],
  "Joub Jannine": ["Lala", "Kamed el Laouz", "Baaloul", "Ghazzeh", "Ain Zebde", "Sohmor", "Yanta", "Deir Tahnich"],
  "Kefraya": ["Ammiq", "Mansoura", "Qab Elias", "Tal Dnoub", "Khirbet Qanafar", "Aana", "Jdita", "Taalabaya"],
  "Qab Elias": ["Chtaura", "Taalabaya", "Terbol", "Wadi Ed Deir", "Bar Elias", "Mreijat", "Jdita", "Bouarej"],
  "Rashaya": ["Tannoura", "Bakkifa", "Aaiha", "Kfar Qouq", "Mdoukha", "Ain Ata", "Masnaa", "Kfar Mishki"],

  // Nabatieh
  "Nabatieh": ["Kfar Remman", "Zefta", "Kfour", "Habbouch", "Kfarfila", "Jbaa", "Ain Qana", "Arabsalim", "Kfar Tibnit", "Mayfadoun"],
  "Bent Jbeil": ["Ain Ebel", "Yaroun", "Maroun el Ras", "Rmeich", "Aita Shaab", "Qouzah", "Tebnine", "Beit Yahoun", "Kafra"],
  "Hasbaya": ["Kfeir", "Khalouat", "Kfar Hamam", "Ain Jarfa", "Mimess", "Shebaa", "Hebbariye", "Marj El Zohour", "Rachaya El Foukhar"],
  "Marjeyoun": ["Qlaiaa", "Houla", "Markaba", "Deir Mimas", "Khiam", "Kfar Kila", "Taibe", "Adaisseh", "Meis el Jabal"],

  // Akkar
  "Halba": ["Qobayat", "Bireh", "Rahbeh", "Bebnin", "Qobeiat", "Majdala", "Aydamoun", "Tikrit", "Menjez", "Cheikh Mohammad"],
  "Qoubaiyat": ["Andqet", "Akkar El Atika", "Michmich", "Fnaidek", "Qorne", "Aayoun El Ghezlan", "Chadra", "Machta Hassan", "Beit el Haouch"]
};

// Backward-compatible alias, kept for existing importers.
export const lebanonVillages = VILLAGES_BY_CITY;