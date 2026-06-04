const ondoProvinceNumbers = [1, 2, 3, 4, 7, 8, 9, 11, 13, 14, 23];

export const defaultOndoProvinces = [
  ...ondoProvinceNumbers.map((number) => ({
  id: `ondo-province-${number}`,
  provinceName: `Ondo Province ${number}`,
  provinceCode: `ONDO-${number}`,
  address: "Ondo State",
  stateRegion: "Ondo",
  provinceEmail: "",
  provincePhone: "",
  provinceLeader: "Province Pastor",
  contactInfo: "",
  status: "active"
  })),
  {
    id: "youth-province-19",
    provinceName: "Youth Province 19",
    provinceCode: "YOUTH-19",
    address: "Ondo State",
    stateRegion: "Ondo",
    provinceEmail: "",
    provincePhone: "",
    provinceLeader: "Province Pastor",
    contactInfo: "",
    status: "active"
  }
];

export const ondoProvinceEvents = {
  "ondo-province-1": "New Believers Class",
  "ondo-province-2": "Prayer & Mentorship",
  "ondo-province-3": "Follow-up Fellowship",
  "ondo-province-4": "Bible Growth Class",
  "ondo-province-7": "Workers Forum",
  "ondo-province-8": "Province Fellowship",
  "ondo-province-9": "Discipleship Class",
  "ondo-province-11": "Prayer Gathering",
  "ondo-province-13": "Community Outreach",
  "ondo-province-14": "Province Fellowship",
  "ondo-province-23": "Follow-up Fellowship",
  "youth-province-19": "Youth Fellowship"
};

export const ondoProvinces = defaultOndoProvinces.map((province) => ({
  ...province,
  event: ondoProvinceEvents[province.id] || "Province Fellowship",
  href: `signup.html?province=${province.id}`
}));
