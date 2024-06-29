"use client";

import React, { useEffect, useState } from "react";
import QueryInput from "./queryinput";
import { homeSearchParamsCache } from "@/lib/searchParams";
import { getSpaces } from "@/app/actions/fetchers";
import { useRouter } from "next/navigation";
import { createChatThread, linkTelegramToUser } from "@/app/actions/doers";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import BackgroundPlus from "@/app/(landing)/GridPatterns/PlusGrid";
import { variants } from "./homeVariants";

const slap = {
  initial: {
    opacity: 0,
    scale: 1.1,
  },
  whileInView: { opacity: 1, scale: 1 },
  transition: {
    duration: 0.5,
    ease: "easeInOut",
  },
  viewport: { once: true },
};

function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // TODO: use this to show a welcome page/modal
  // const { firstTime } = homeSearchParamsCache.parse(searchParams);

  const [telegramUser, setTelegramUser] = useState<string | undefined>(
    searchParams.telegramUser as string,
  );

  const { push } = useRouter();

  const [spaces, setSpaces] = useState<{ id: number; name: string }[]>([]);

  const [showVariant, setShowVariant] = useState<number>(0);

  useEffect(() => {
    if (telegramUser) {
      const linkTelegram = async () => {
        const response = await linkTelegramToUser(telegramUser);

        if (response.success) {
          toast.success("Your telegram has been linked successfully.");
        } else {
          toast.error("Failed to link telegram. Please try again.");
        }
      };

      linkTelegram();
    }

    getSpaces().then((res) => {
      if (res.success && res.data) {
        setSpaces(res.data);
        return;
      }
      // TODO: HANDLE ERROR
    });

    setShowVariant(Math.floor(Math.random() * variants.length));
  }, []);

  return (
    <div className="max-w-3xl h-full justify-center flex mx-auto w-full flex-col">
      {/* all content goes here */}
      {/* <div className="">hi {firstTime ? 'first time' : ''}</div> */}

      <motion.h1
        {...{
          ...slap,
          transition: { ...slap.transition, delay: 0.2 },
        }}
        className="text-center mx-auto bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]  bg-clip-text text-4xl tracking-tighter   text-transparent md:text-5xl"
      >
        {variants[showVariant]!.map((v, i) => {
          return (
            <span
              key={i}
              className={
                v.type === "highlighted"
                  ? "bg-gradient-to-r to-blue-200 from-zinc-300 text-transparent bg-clip-text"
                  : ""
              }
            >
              {v.content}
            </span>
          );
        })}
      </motion.h1>

      <div className="w-full pb-20 mt-12">
        <QueryInput
          handleSubmit={async (q, spaces) => {
            if (q.length === 0) {
              toast.error("Query is required");
              return;
            }

            const threadid = await createChatThread(q);

            if (!threadid.success || !threadid.data) {
              toast.error("Failed to create chat thread");
              return;
            }

            push(
              `/chat/${threadid.data}?spaces=${JSON.stringify(spaces)}&q=${q}`,
            );
          }}
          initialSpaces={spaces}
          setInitialSpaces={setSpaces}
        />
      </div>
    </div>
  );
}

export default Page;
