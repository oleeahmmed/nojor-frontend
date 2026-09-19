"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Lock, UserRound } from "lucide-react";
import {
  getDisplayName,
  getNameChangeGate,
  hydrateIdentity,
  isValidName,
  setDisplayName,
  type NameChangeGate,
} from "@/lib/identity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type IdentityCtx = {
  name: string;
  ready: boolean;
  nameGate: NameChangeGate;
  /** Prompt for a name if missing, then resolve with it. */
  requireName: () => Promise<string>;
  saveName: (name: string) => string;
  /** Profile click — set name only if missing; else show locked profile. */
  openProfile: () => void;
};

const Ctx = createContext<IdentityCtx | null>(null);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  const [nameGate, setNameGate] = useState<NameChangeGate>(() =>
    getNameChangeGate(),
  );
  const [mode, setMode] = useState<"closed" | "set" | "locked" | "rename">(
    "closed",
  );
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const waiters = useRef<((n: string) => void)[]>([]);

  const refreshGate = useCallback(() => {
    setNameGate(getNameChangeGate());
  }, []);

  useEffect(() => {
    void hydrateIdentity().then((id) => {
      setName(id.name);
      setNameGate(getNameChangeGate());
      setReady(true);
    });
  }, []);

  const finish = useCallback(
    (saved: string) => {
      setName(saved);
      setMode("closed");
      setError("");
      refreshGate();
      const q = waiters.current;
      waiters.current = [];
      q.forEach((fn) => fn(saved));
    },
    [refreshGate],
  );

  const requireName = useCallback(() => {
    const current = getDisplayName();
    if (current) {
      setName(current);
      return Promise.resolve(current);
    }
    setDraft("");
    setError("");
    setMode("set");
    return new Promise<string>((resolve) => {
      waiters.current.push(resolve);
    });
  }, []);

  const saveName = useCallback(
    (raw: string) => {
      const err = isValidName(raw);
      if (err) {
        setError(err);
        return "";
      }
      const result = setDisplayName(raw);
      if (!result.ok) {
        setError(result.error);
        refreshGate();
        return "";
      }
      finish(result.name);
      return result.name;
    },
    [finish, refreshGate],
  );

  const openProfile = useCallback(() => {
    const current = getDisplayName();
    const gate = getNameChangeGate();
    setNameGate(gate);
    setError("");
    if (!current) {
      setDraft("");
      setMode("set");
      return;
    }
    setDraft(current);
    setMode("locked");
  }, []);

  const open = mode !== "closed";

  return (
    <Ctx.Provider value={{ name, ready, nameGate, requireName, saveName, openProfile }}>
      {children}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setMode("closed");
            waiters.current = [];
          }
        }}
      >
        <DialogContent
          showCloseButton={mode === "locked"}
          overlayClassName="bg-black/50 dark:bg-black/70 backdrop-blur-[3px]"
          className="w-[min(420px,calc(100vw-1.5rem))] gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-2xl"
        >
          {mode === "locked" ? (
            <>
              <div className="brand-gradient px-5 py-4 text-white">
                <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold">
                  <UserRound className="h-4.5 w-4.5" />
                  আপনার প্রোফাইল
                </DialogTitle>
                <DialogDescription className="mt-1 text-[12px] text-white/80">
                  এই ডিভাইসে আপনার পরিচয় লক করা। ঘন ঘন নাম বদলানো যায় না।
                </DialogDescription>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      ডিভাইস লক · অ্যাকাউন্ট নেই
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {nameGate.allowed
                    ? "৩০ দিন পর একবার নাম বদলানো যায় — অপব্যবহার রোধে সীমিত।"
                    : nameGate.reason}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => setMode("closed")}
                  >
                    বন্ধ
                  </Button>
                  {nameGate.allowed ? (
                    <Button
                      type="button"
                      className="brand-gradient rounded-full border-0 text-white"
                      onClick={() => {
                        setDraft(name);
                        setError("");
                        setMode("rename");
                      }}
                    >
                      নাম বদলান
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="brand-gradient px-5 py-4 text-white">
                <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold">
                  <UserRound className="h-4.5 w-4.5" />
                  {mode === "rename" ? "নাম বদলান" : "আপনার নাম দিন"}
                </DialogTitle>
                <DialogDescription className="mt-1 text-[12px] text-white/80">
                  {mode === "rename"
                    ? "এই ডিভাইসে নাম মাত্র একবার বদলানো যায়। পরে আর পরিবর্তন করা যাবে না।"
                    : "লগইন লাগবে না। এই ডিভাইসে আপনার লাইক, মন্তব্য ও মত এই নামেই থাকবে।"}
                </DialogDescription>
              </div>
              <form
                className="px-5 py-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveName(draft);
                }}
              >
                <label className="mb-1.5 block text-[13px] font-medium">
                  প্রদর্শিত নাম
                </label>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  maxLength={40}
                  placeholder="যেমন: রহিম, আনোয়ারা…"
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
                {error ? (
                  <p className="mt-2 text-[12px] text-destructive">{error}</p>
                ) : (
                  <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
                    নাম শুধু আপনার ব্রাউজারে সেভ হয়। একবার সেট হলে সহজে বদলানো যায় না।
                  </p>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => {
                      if (mode === "rename") {
                        setMode("locked");
                        setError("");
                      } else {
                        setMode("closed");
                        waiters.current = [];
                      }
                    }}
                  >
                    {mode === "rename" ? "পেছনে" : "পরে"}
                  </Button>
                  <Button
                    type="submit"
                    className="brand-gradient rounded-full border-0 text-white"
                  >
                    সেভ করুন
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIdentity must be used within IdentityProvider");
  return ctx;
}
