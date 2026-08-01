import { Gamepad2, Globe2 } from "lucide-react";

import { signInWithOAuth } from "@/features/auth/actions";

export function OAuthButtons({ next = "/dashboard" }: { next?: string }) {
  return (
    <div className="oauth-stack">
      <form action={signInWithOAuth}>
        <input type="hidden" name="provider" value="discord" />
        <input type="hidden" name="next" value={next} />
        <button className="oauth-button discord" type="submit"><Gamepad2 aria-hidden="true" /> Continuar com Discord</button>
      </form>
      <form action={signInWithOAuth}>
        <input type="hidden" name="provider" value="google" />
        <input type="hidden" name="next" value={next} />
        <button className="oauth-button google" type="submit"><Globe2 aria-hidden="true" /> Continuar com Google</button>
      </form>
      <div className="divider"><span>ou use seu e-mail</span></div>
    </div>
  );
}
