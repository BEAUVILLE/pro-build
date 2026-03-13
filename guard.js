/* guard.js — ENTREPRENEUR MULTI SERVICES / BUILD GUARD
   Rail attendu par pin.html / cockpit.html / profile.html :
   - slug-only : ?slug=build-221...
   - window.DIGIY_GUARD.ready
   - window.DIGIY_GUARD.state
   - window.DIGIY_GUARD.loginWithPin(slug, pin)
*/
(() => {
  "use strict";

  const SUPABASE_URL = "https://wesqmwjjtsefyjnluosj.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmVzZSIsInJlZiI6Indlc3Ftd2pqdHNlZnlqbmx1b3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzg4ODIsImV4cCI6MjA4MDc1NDg4Mn0.dZfYOc2iL2_wRYL3zExZFsFSBK6AbMeOid2LrIjcTdA";

  const MODULE_CODE = "BUILD";
  const PAY_URL = "https://commencer-a-payer.digiylyfe.com/";
  const ALLOW_PREVIEW_WITHOUT_IDENTITY = true;

  const SESSION_KEY = "DIGIY_SESSION";
  const ACCESS_KEY = "DIGIY_ACCESS";
  const MODULE_PREFIX = "digiy_build";

  const qs = new URLSearchParams(location.search);

  const state = {
    preview: true,
    access_ok: false,
    reason: "booting",
    slug: "",
    phone: "",
    module: MODULE_CODE
  };

  const api = {
    state,
    ready: null,
    getSession,
    loginWithPin,
    logout
  };

  window.DIGIY_GUARD = api;

  function normPhone(v) {
    return String(v || "").replace(/[^\d]/g, "");
  }

  function normPin(v) {
    return String(v || "").trim().replace(/\s+/g, "");
  }

  function normSlug(v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function jsonHeaders() {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    };
  }

  function getHeaders() {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: "application/json"
    };
  }

  async function rpc(name, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(body || {})
    });

    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  }

  async function tableGet(table, paramsObj) {
    const params = new URLSearchParams(paramsObj || {});
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
      method: "GET",
      headers: getHeaders()
    });

    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  }

  function setState(patch) {
    Object.assign(state, patch || {});
    api.state = state;
    window.DIGIY_GUARD.state = state;
  }

  function rememberIdentity({ slug, phone }) {
    const s = normSlug(slug);
    const p = normPhone(phone);

    try {
      const sessionObj = {
        module: MODULE_CODE,
        slug: s || "",
        phone: p || "",
        at: nowIso()
      };

      if (s) {
        sessionStorage.setItem(`${MODULE_PREFIX}_slug`, s);
        sessionStorage.setItem(`${MODULE_PREFIX}_last_slug`, s);
        localStorage.setItem(`${MODULE_PREFIX}_last_slug`, s);
      }

      if (p) {
        sessionStorage.setItem(`${MODULE_PREFIX}_phone`, p);
        localStorage.setItem(`${MODULE_PREFIX}_phone`, p);
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionObj));
      localStorage.setItem(ACCESS_KEY, JSON.stringify(sessionObj));
      window.DIGIY_ACCESS = Object.assign({}, window.DIGIY_ACCESS || {}, sessionObj);
    } catch (_) {}
  }

  function getSession() {
    const fromUrlSlug = normSlug(qs.get("slug") || "");
    const fromUrlPhone = normPhone(qs.get("phone") || "");

    let stored = null;

    try {
      const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem(ACCESS_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch (_) {}

    const sessionSlug = normSlug(
      fromUrlSlug ||
      sessionStorage.getItem(`${MODULE_PREFIX}_slug`) ||
      sessionStorage.getItem(`${MODULE_PREFIX}_last_slug`) ||
      localStorage.getItem(`${MODULE_PREFIX}_last_slug`) ||
      stored?.slug ||
      window.DIGIY_ACCESS?.slug ||
      ""
    );

    const sessionPhone = normPhone(
      fromUrlPhone ||
      sessionStorage.getItem(`${MODULE_PREFIX}_phone`) ||
      localStorage.getItem(`${MODULE_PREFIX}_phone`) ||
      stored?.phone ||
      window.DIGIY_ACCESS?.phone ||
      ""
    );

    return {
      module: MODULE_CODE,
      slug: sessionSlug,
      phone: sessionPhone
    };
  }

  function logout() {
    try {
      sessionStorage.removeItem(`${MODULE_PREFIX}_slug`);
      sessionStorage.removeItem(`${MODULE_PREFIX}_last_slug`);
      sessionStorage.removeItem(`${MODULE_PREFIX}_phone`);
      localStorage.removeItem(`${MODULE_PREFIX}_last_slug`);
      localStorage.removeItem(`${MODULE_PREFIX}_phone`);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ACCESS_KEY);
      delete window.DIGIY_ACCESS;
    } catch (_) {}

    setState({
      preview: true,
      access_ok: false,
      reason: "logged_out",
      slug: "",
      phone: ""
    });
  }

  function enrichUrlIfMissingSlug(slug) {
    const s = normSlug(slug);
    if (!s) return;

    const current = normSlug(qs.get("slug") || "");
    if (current === s) return;

    const u = new URL(location.href);
    u.searchParams.set("slug", s);
    history.replaceState(null, "", u.toString());
  }

  function buildPayUrl({ slug, phone }) {
    const u = new URL(PAY_URL);
    const s = normSlug(slug);
    const p = normPhone(phone);

    u.searchParams.set("module", MODULE_CODE);
    if (s) u.searchParams.set("slug", s);
    if (p) u.searchParams.set("phone", p);
    u.searchParams.set("return", location.href);

    return u.toString();
  }

  function goPay({ slug, phone }) {
    location.replace(buildPayUrl({ slug, phone }));
  }

  async function resolveSubBySlug(slug) {
    const s = normSlug(slug);
    if (!s) return null;

    const res = await tableGet("digiy_subscriptions_public", {
      select: "phone,slug,module",
      slug: `eq.${s}`,
      module: `eq.${MODULE_CODE}`,
      limit: "1"
    });

    if (!res.ok || !Array.isArray(res.data) || !res.data[0]) return null;

    return {
      slug: normSlug(res.data[0].slug),
      phone: normPhone(res.data[0].phone),
      module: String(res.data[0].module || "")
    };
  }

  async function resolveSubByPhone(phone) {
    const p = normPhone(phone);
    if (!p) return null;

    const res = await tableGet("digiy_subscriptions_public", {
      select: "phone,slug,module",
      phone: `eq.${p}`,
      module: `eq.${MODULE_CODE}`,
      limit: "1"
    });

    if (!res.ok || !Array.isArray(res.data) || !res.data[0]) return null;

    return {
      slug: normSlug(res.data[0].slug),
      phone: normPhone(res.data[0].phone),
      module: String(res.data[0].module || "")
    };
  }

  async function checkAccess(phone) {
    const p = normPhone(phone);
    if (!p) return false;

    const tries = [
      { name: "digiy_has_access", body: { p_phone: p, p_module: MODULE_CODE } },
      { name: "digiy_has_access", body: { phone: p, module: MODULE_CODE } }
    ];

    for (const t of tries) {
      const res = await rpc(t.name, t.body);
      if (!res.ok) continue;
      if (res.data === true) return true;
      if (res.data?.ok === true) return true;
      if (res.data?.access === true) return true;
    }

    return false;
  }

  async function attemptPinLoginRPCs(slug, pin, phone) {
    const s = normSlug(slug);
    const p = normPin(pin);
    const ph = normPhone(phone);

    const rpcNames = [
      "build_pin_login",
      "digiy_pin_login",
      "pin_login",
      "digiy_login_with_pin"
    ];

    const bodies = [
      { p_slug: s, p_pin: p, p_module: MODULE_CODE, p_phone: ph },
      { slug: s, pin: p, module: MODULE_CODE, phone: ph },
      { p_slug: s, p_pin: p, p_module: MODULE_CODE },
      { slug: s, pin: p, module: MODULE_CODE },
      { p_slug: s, p_pin: p },
      { slug: s, pin: p }
    ];

    for (const name of rpcNames) {
      for (const body of bodies) {
        const res = await rpc(name, body);
        if (!res.ok) continue;

        const d = res.data;
        if (d === true) return { ok: true, slug: s, phone: ph };
        if (d?.ok === true || d?.success === true) {
          return {
            ok: true,
            slug: normSlug(d.slug || s),
            phone: normPhone(d.phone || ph)
          };
        }
      }
    }

    return null;
  }

  async function attemptPinLoginTable(slug, pin, phone) {
    const ph = normPhone(phone);
    const p = normPin(pin);
    if (!ph || !p) return null;

    const res = await tableGet("digiy_access_pins", {
      select: "*",
      phone: `eq.${ph}`,
      module: `eq.${MODULE_CODE}`,
      limit: "10"
    });

    if (!res.ok || !Array.isArray(res.data)) return null;

    const now = Date.now();

    for (const row of res.data) {
      const rawPin =
        row.pin ??
        row.pin_code ??
        row.code ??
        row.access_pin ??
        row.plain_pin ??
        "";

      if (String(rawPin).trim() !== p) continue;
      if (row.is_active === false) continue;

      const status = String(row.status || "").toLowerCase().trim();
      if (["revoked", "inactive", "disabled"].includes(status)) continue;

      if (row.expires_at) {
        const exp = Date.parse(row.expires_at);
        if (!Number.isNaN(exp) && exp < now) continue;
      }

      return {
        ok: true,
        slug: normSlug(slug),
        phone: ph
      };
    }

    return null;
  }

  async function loginWithPin(slug, pin) {
    const s = normSlug(slug);
    const p = normPin(pin);

    if (!s) return { ok: false, error: "Slug manquant." };
    if (!p) return { ok: false, error: "PIN manquant." };

    const sub = await resolveSubBySlug(s);
    const phone = normPhone(sub?.phone);

    if (!phone) {
      return { ok: false, error: "Slug inconnu." };
    }

    let auth = await attemptPinLoginRPCs(s, p, phone);
    if (!auth) {
      auth = await attemptPinLoginTable(s, p, phone);
    }

    if (!auth?.ok) {
      return { ok: false, error: "PIN invalide." };
    }

    const hasAccess = await checkAccess(phone);
    if (!hasAccess) {
      return { ok: false, error: "Abonnement inactif." };
    }

    rememberIdentity({ slug: s, phone });
    enrichUrlIfMissingSlug(s);

    setState({
      preview: false,
      access_ok: true,
      reason: "pin_ok",
      slug: s,
      phone
    });

    return {
      ok: true,
      slug: s,
      phone
    };
  }

  async function boot() {
    try {
      let { slug, phone } = getSession();

      if (slug && !phone) {
        const sub = await resolveSubBySlug(slug);
        if (sub?.phone) phone = normPhone(sub.phone);
        if (sub?.slug) slug = normSlug(sub.slug);
      }

      if (phone && !slug) {
        const sub = await resolveSubByPhone(phone);
        if (sub?.slug) slug = normSlug(sub.slug);
      }

      if (slug || phone) {
        rememberIdentity({ slug, phone });
      }

      if (!slug && !phone) {
        if (ALLOW_PREVIEW_WITHOUT_IDENTITY) {
          setState({
            preview: true,
            access_ok: false,
            reason: "preview_no_identity",
            slug: "",
            phone: ""
          });
          return;
        }
        goPay({ slug: "", phone: "" });
        return;
      }

      if (phone) {
        const ok = await checkAccess(phone);

        if (ok) {
          if (slug) enrichUrlIfMissingSlug(slug);

          setState({
            preview: false,
            access_ok: true,
            reason: "access_ok",
            slug: normSlug(slug),
            phone: normPhone(phone)
          });
          return;
        }

        if (ALLOW_PREVIEW_WITHOUT_IDENTITY) {
          setState({
            preview: true,
            access_ok: false,
            reason: "no_subscription",
            slug: normSlug(slug),
            phone: normPhone(phone)
          });
          return;
        }

        goPay({ slug, phone });
        return;
      }

      if (ALLOW_PREVIEW_WITHOUT_IDENTITY) {
        setState({
          preview: true,
          access_ok: false,
          reason: "unknown_identity",
          slug: normSlug(slug),
          phone: ""
        });
          return;
      }

      goPay({ slug, phone: "" });
    } catch (e) {
      console.error("DIGIY_GUARD boot error:", e);

      setState({
        preview: true,
        access_ok: false,
        reason: "guard_error",
        slug: "",
        phone: ""
      });
    }
  }

  api.ready = boot();
})();
