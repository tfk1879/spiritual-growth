export const defaultOndoProvinces = [1, 2, 3, 4, 6, 8, 9, 16, 22].map((number) => ({
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
}));

export const ondoProvinceEvents = {
  "ondo-province-1": "New Believers Class",
  "ondo-province-2": "Prayer & Mentorship",
  "ondo-province-3": "Follow-up Fellowship",
  "ondo-province-4": "Bible Growth Class",
  "ondo-province-6": "Workers Forum",
  "ondo-province-8": "Province Fellowship",
  "ondo-province-9": "Discipleship Class",
  "ondo-province-16": "Prayer Gathering",
  "ondo-province-22": "Community Outreach"
};

export const ondoProvinces = defaultOndoProvinces.map((province) => ({
  ...province,
  event: ondoProvinceEvents[province.id] || "Province Fellowship",
  href: `signup.html?province=${province.id}`
}));
