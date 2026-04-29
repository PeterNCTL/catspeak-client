const USER_PALETTES = [
  {
    bg: "radial-gradient(circle, #2563EB 0%, #1E3A8A 100%)",
    avatarClass: "!bg-[#93C5FD] !text-[#1E3A8A]",
  }, // Blue
  {
    bg: "radial-gradient(circle, #16A34A 0%, #14532D 100%)",
    avatarClass: "!bg-[#86EFAC] !text-[#14532D]",
  }, // Green
  {
    bg: "radial-gradient(circle, #D97706 0%, #78350F 100%)",
    avatarClass: "!bg-[#FDE68A] !text-[#78350F]",
  }, // Yellow
  {
    bg: "radial-gradient(circle, #DB2777 0%, #831843 100%)",
    avatarClass: "!bg-[#F9A8D4] !text-[#831843]",
  }, // Pink
  {
    bg: "radial-gradient(circle, #9333EA 0%, #581C87 100%)",
    avatarClass: "!bg-[#C4B5FD] !text-[#581C87]",
  }, // Purple
]

export const getParticipantTheme = (identity, name) => {
  const str = String(identity || "") + String(name || "")
  if (!str) return USER_PALETTES[0]

  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return USER_PALETTES[Math.abs(hash) % USER_PALETTES.length]
}
