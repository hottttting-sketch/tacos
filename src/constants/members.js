export const MEMBERS = [
  { id: 1, name: "佐藤 健一", dept: "営業局 営業一部", email: "sato@agency-tacos.co.jp", tel: "03-1234-1111", isKyokutan: true },
  { id: 2, name: "鈴木 美咲", dept: "メディア推進局 局担推進部", email: "suzuki@agency-tacos.co.jp", tel: "03-1234-2222", isKyokutan: true },
  { id: 3, name: "渡辺 裕二", dept: "営業局 営業二部", email: "watanabe@agency-tacos.co.jp", tel: "03-1234-3333", isKyokutan: true },
  { id: 4, name: "田村 淳", dept: "管理部", email: "tamura@agency-tacos.co.jp", tel: "03-1234-4444", isKyokutan: false }
];

export const getContactNames = (selectedMemberIds) => {
  if (!selectedMemberIds || !Array.isArray(selectedMemberIds) || selectedMemberIds.length === 0) return '未設定';
  return selectedMemberIds
    .map(id => MEMBERS.find(m => m.id === id)?.name)
    .filter(Boolean)
    .join('、');
};
