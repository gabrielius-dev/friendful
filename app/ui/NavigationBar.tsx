"use client";

import Link from "next/link";
import { permanent_marker } from "./fonts";
import { Fragment, useState } from "react";
import { usePathname } from "next/navigation";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { PopupState as PopupStateType } from "material-ui-popup-state/hooks";
import { Avatar, Menu, MenuItem } from "@mui/material";
import { signOut } from "next-auth/react";
import { User } from "@prisma/client";

export default function NavigationBar({ currentUser }: { currentUser: User }) {
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname();

  async function handleLogout(popupState: PopupStateType) {
    await signOut();
    popupState.close();
  }
  return (
    <nav className="bg-white shadow-md fixed w-full z-[9999] top-0">
      <div className="flex flex-wrap items-center mx-auto p-4 z-[9999]">
        <Link
          href={`${process.env.NEXT_PUBLIC_ROOT_URL}/`}
          className="flex items-center space-x-3"
        >
          <span
            className={`self-center text-4xl font-normal whitespace-nowrap bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-[#fd1d1d] text-transparent bg-clip-text ${permanent_marker.className}`}
          >
            Friendful
          </span>
        </Link>
        <div className="flex gap-4 ml-auto">
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            onClick={() => {
              setShowMenu((prevValue) => !prevValue);
            }}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
          <div className="ml-auto">
            <PopupState
              variant="popover"
              popupId="popup-menu"
              disableAutoFocus={true}
            >
              {(popupState) => (
                <Fragment>
                  <Avatar
                    alt="Profile picture"
                    src={currentUser?.image ?? undefined}
                    sx={{
                      width: 40,
                      height: 40,
                      background: currentUser.avatarBackgroundColor,
                      cursor: "pointer",
                      "&:hover": {
                        filter: "brightness(95%)",
                      },
                    }}
                    {...bindTrigger(popupState)}
                  >
                    {!currentUser?.image
                      ? currentUser?.name![0].toUpperCase()
                      : null}
                  </Avatar>
                  <Menu {...bindMenu(popupState)} sx={{ zIndex: 9999 }}>
                    <MenuItem onClick={popupState.close}>
                      <Link href={`/profile/${currentUser.id}`}>
                        My profile
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={() => void handleLogout(popupState)}>
                      Sign out
                    </MenuItem>
                  </Menu>
                </Fragment>
              )}
            </PopupState>
          </div>
        </div>
        <div
          className={`items-center justify-between ${
            showMenu ? "block" : "hidden"
          } w-full md:flex md:w-auto md:order-1`}
          id="navbar-search"
        >
          <ul className="flex flex-col p-4 md:hidden mt-4 font-medium border rounded-lg shadow-md rtl:space-x-reverse  md:mt-0 md:border-0">
            <li>
              <Link
                href="/"
                className={`block py-2 px-3  ${
                  pathname === "/"
                    ? "text-white bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-[#fd1d1d]"
                    : "text-gray-900 bg-transparent hover:bg-gray-100"
                } rounded`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/friends"
                className={`block py-2 px-3  ${
                  pathname === "/friends"
                    ? "text-white bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-[#fd1d1d]"
                    : "text-gray-900 bg-transparent hover:bg-gray-100"
                } rounded`}
              >
                Friends
              </Link>
            </li>
            <li>
              <Link
                href="/bookmarks"
                className={`block py-2 px-3  ${
                  pathname === "/bookmarks"
                    ? "text-white bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-[#fd1d1d]"
                    : "text-gray-900 bg-transparent hover:bg-gray-100"
                } rounded`}
              >
                Bookmarks
              </Link>
            </li>
            <li>
              <Link
                href="/notifications"
                className={`block py-2 px-3  ${
                  pathname === "/notifications"
                    ? "text-white bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-[#fd1d1d]"
                    : "text-gray-900 bg-transparent hover:bg-gray-100"
                } rounded`}
              >
                Notifications
              </Link>
            </li>
            <li>
              <Link
                href={`/profile/${currentUser.id}`}
                className={`block py-2 px-3  ${
                  pathname === `/profile/${currentUser.id}`
                    ? "text-white bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-[#fd1d1d]"
                    : "text-gray-900 bg-transparent hover:bg-gray-100"
                } rounded`}
              >
                Profile
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
