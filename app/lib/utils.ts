import { LikeType, Prisma } from "@prisma/client/edge";
import { z } from "zod";
import prisma from "./prisma";
import imageCompression from "browser-image-compression";
import { CountField } from "./types";

export function formatZodErrors(errors: z.ZodError): Record<string, string[]> {
  const errorObject: Record<string, string[]> = {};

  errors.issues.forEach((error) => {
    const [key] = error.path; // Get the first element of the path array
    const message = [error.message];
    errorObject[key] = message;
  });

  return errorObject;
}

const findSpecificUser = (email: string) => {
  return Prisma.validator<Prisma.UserWhereInput>()({
    email,
  });
};

export async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: findSpecificUser(email),
    });
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user.");
  }
}

export async function getAuthUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      },
    });
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user.");
  }
}

export const compressImage = async (image: File) => {
  const options = {
    maxSizeMB: 5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  const compressedFile = await imageCompression(image, options);
  return compressedFile;
};

export function getRandomAvatarColor() {
  const backgroundColors = [
    "#3498db", // Blue
    "#2ecc71", // Green
    "#f39c12", // Orange
    "#9b59b6", // Purple
    "#1abc9c", // Turquoise
    "#16a085", // Green Sea
    "#2980b9", // Belize Hole
  ];
  const randomColor =
    backgroundColors[Math.floor(Math.random() * backgroundColors.length)];

  return randomColor;
}

export function formatDate(date: Date) {
  const now = new Date();

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  function isSameWeek(date1: Date, date2: Date) {
    const firstDayOfWeek = 1;

    const currentWeekStart = new Date(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate() - ((date2.getDay() - firstDayOfWeek + 7) % 7)
    );

    const currentWeekEnd = new Date(
      currentWeekStart.getFullYear(),
      currentWeekStart.getMonth(),
      currentWeekStart.getDate() + 6
    );

    return (
      date1.getTime() >= currentWeekStart.getTime() &&
      date1.getTime() <= currentWeekEnd.getTime()
    );
  }

  if (isSameDay(date, now)) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return `Yesterday ${new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date)}`;
  }

  if (isSameWeek(date, now)) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date);
  }

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  if (date < startOfWeek) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date);
  }

  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  if (date < oneYearAgo) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(date);
}

export function formatNumbers(number: number) {
  if (number < 1000) {
    return number.toString();
  } else if (number < 1000000) {
    return (number / 1000).toFixed(2) + "K";
  } else {
    return (number / 1000000).toFixed(2) + "M";
  }
}

export function getCountField(type: LikeType): CountField {
  const reactionMap: Record<LikeType, CountField> = {
    like: "likeCount",
    love: "loveCount",
    care: "careCount",
    haha: "hahaCount",
    wow: "wowCount",
    sad: "sadCount",
    angry: "angryCount",
  };

  return reactionMap[type];
}

export function formatCommentTime(date: Date) {
  const now = new Date();
  const diff: number = Math.abs(now.getTime() - date.getTime());

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

  if (minutes < 60) {
    return minutes + " min.";
  } else if (hours < 24) {
    return hours + " h.";
  } else if (days < 31) {
    return days + " d.";
  } else {
    return years + " y.";
  }
}

export function formatTooltipTime(date: Date) {
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");

  return `${year} ${month} ${day}, ${weekday}, ${hour}:${minute}`;
}
