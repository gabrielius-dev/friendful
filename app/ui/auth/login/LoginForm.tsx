"use client";

import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "../../../lib/actions";
import { poppins } from "../../fonts";
import Link from "next/link";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import OAuthProviderButtons from "../OAuthProviderButtons";
import { ToastContainer, toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { PulseLoader } from "react-spinners";
import "react-toastify/dist/ReactToastify.css";

export default function LoginForm() {
  const [errors, dispatch] = useFormState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "OAuthAccountNotLinked") {
      toast.error(
        "Another account already exists with the same email address.",
        {
          position: "bottom-left",
        }
      );
    }
  }, [error]);

  return (
    <div
      className={`p-8 shadow-lg rounded-lg md:rounded-r-none md:min-w-[350px] ${poppins.className} max-w-sm`}
    >
      <form
        className="flex flex-col gap-6 items-center justify-center"
        action={dispatch}
      >
        <Typography
          variant="h4"
          sx={{ textAlign: "center", fontWeight: "bold" }}
        >
          Login
        </Typography>
        <FormControl
          variant="outlined"
          required={true}
          error={
            typeof errors === "object" &&
            errors.email &&
            errors.email.length > 0
          }
          sx={{ width: "100%" }}
        >
          <InputLabel htmlFor="email">Email</InputLabel>
          <OutlinedInput
            sx={{ borderRadius: 10 }}
            id="email"
            type="email"
            inputProps={{ maxLength: 100 }}
            label="Email"
            name="email"
            aria-describedby="email-error"
            autoFocus
          />
          {typeof errors === "object" &&
            errors.email &&
            errors.email.length > 0 && (
              <FormHelperText
                id="email-error"
                error={true}
                aria-live="polite"
                aria-atomic="true"
              >
                {errors.email[0]}
              </FormHelperText>
            )}
        </FormControl>
        <FormControl
          variant="outlined"
          required={true}
          error={
            typeof errors === "object" &&
            errors.password &&
            errors.password.length > 0
          }
          sx={{ width: "100%" }}
        >
          <InputLabel htmlFor="password">Password</InputLabel>
          <OutlinedInput
            sx={{
              borderRadius: 10,
            }}
            id="password"
            name="password"
            aria-describedby="password-error"
            type={showPassword ? "text" : "password"}
            inputProps={{ maxLength: 100, minLength: 8 }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
          {typeof errors === "object" &&
            errors.password &&
            errors.password.length > 0 && (
              <FormHelperText
                id="password-error"
                error={true}
                aria-live="polite"
                aria-atomic="true"
              >
                {errors.password[0]}
              </FormHelperText>
            )}
        </FormControl>
        <LoginButton />

        {typeof errors === "string" && (
          <div
            className="flex items-end space-x-1 max-w-full"
            aria-live="polite"
            aria-atomic="true"
          >
            <>
              <p className="text-sm text-red-500 break-all text-center">
                {errors}
              </p>
            </>
          </div>
        )}

        <LoginAlternative />
      </form>

      <div className="flex mt-4 justify-center">
        <p className="text-semibold text-center">
          Don&apos;t have an account?
          <Link
            href="/sign-up"
            className="bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-[#fd1d1d] inline-block text-transparent bg-clip-text relative ml-2"
          >
            <span className="group">
              Sign up
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] group-hover:opacity-100 opacity-0 transition-opacity"></span>
            </span>
          </Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-[#fd1d1d] text-white px-8 py-2 rounded-full font-semibold w-full`}
      disabled={pending}
    >
      {pending ? (
        <PulseLoader
          color="white"
          cssOverride={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "24px",
          }}
        />
      ) : (
        "Login"
      )}
    </button>
  );
}

function LoginAlternative() {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-4 mt-[-0.75rem] max-w-full break-all">
      <div className="relative flex py-3 items-center w-full">
        <div className="flex-grow border-t border-gray-400"></div>
        <span className="flex-shrink mx-4 text-gray-400 ">or login with</span>
        <div className="flex-grow border-t border-gray-400"></div>
      </div>
      <OAuthProviderButtons />
      <button
        className="px-4 py-2 border flex gap-2 border-slate-200  rounded-lg text-slate-700  hover:border-slate-400  hover:text-slate-900  hover:shadow transition duration-150 min-w-fit flex-grow justify-center"
        disabled={pending}
      >
        <PersonRoundedIcon />
        <span>Demo account</span>
      </button>
    </div>
  );
}
