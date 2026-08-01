// PIN for the admin section at the bottom of the Info tab, used to clear a
// stuck scorekeeper claim from a phone on the course without needing
// Firebase console access. This is a UI speed bump only, NOT a real access
// control — firestore.rules allows any signed-in visitor to clear a claim
// regardless of this PIN (rules can't see it), so change it here if you
// want, but don't treat it as a security boundary. See the security note in
// README.md.
export const ADMIN_PIN = '6625'
