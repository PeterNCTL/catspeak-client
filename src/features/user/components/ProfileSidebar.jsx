import React from "react"
import { NavLink } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { User, GraduationCap, Building2, Settings } from "lucide-react"

const ProfileSidebar = () => {
  const { t } = useLanguage()

  const menuItems = [
    {
      label: t.profile?.sidebar?.personalInfo,
      path: "/profile",
      end: true,
      icon: User,
    },
    {
      label: t.profile?.sidebar?.lecturer,
      path: "/lecturer",
      end: false,
      icon: GraduationCap,
    },
    {
      label: t.profile?.sidebar?.organization,
      path: "/organization",
      end: false,
      icon: Building2,
    },
    {
      label: t.profile?.sidebar?.setting,
      path: "/setting",
      end: false,
      icon: Settings,
    },
  ]

  return (
    <div className="flex flex-col space-y-1">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `flex w-full h-10 items-center gap-3 px-4 text-left text-sm transition-colors rounded-[5px] ${
              isActive
                ? "bg-[#F2F2F2] text-[#990011] hover:bg-[#E6E6E6] hover:text-[#990011]"
                : "text-gray-700 hover:bg-[#F2F2F2] hover:text-gray-900"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={isActive ? "text-[#990011]" : ""} />
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}

export default ProfileSidebar
