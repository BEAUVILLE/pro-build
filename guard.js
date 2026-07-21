/*
  DIGIY BUILD — garde stricte PIN 8 h
  Autorité : session BUILD créée par pin.html après PIN valide et accès actif.
*/
(function(){
  "use strict";
  const MODULE="BUILD";
  const MODULE_ALIASES=new Set(["BUILD","BUILD_PRO","PRO_BUILD"]);
  const LOGIN_URL=window.DIGIY_LOGIN_URL||"./pin.html";
  const TTL=8*60*60*1000;
  const SKEW=60*1000;
  const SESSION_KEYS=[
    "digiy_build_session","digiy_build_guard_session","digiy_guard_build_session",
    "DIGIY_BUILD_ACCESS","DIGIY_PRO_BUILD_ACCESS","DIGIY_ACCESS","DIGIY_MODULE_ACCESS"
  ];
  const IDENTITY_KEYS=[
    "digiy_build_phone","digiy_build_last_phone","DIGIY_BUILD_PHONE",
    "digiy_build_slug","digiy_build_last_slug","DIGIY_BUILD_SLUG",
    "DIGIY_CURRENT_SLUG","DIGIY_SLUG","digiy_slug","digiy_last_slug"
  ];
  const SENSITIVE_KEYS=[
    "phone","tel","p_phone","owner_phone","owner_id","whatsapp","msisdn",
    "pin","pin4","code","token","session","session_token","access_token",
    "access","auth","ok","unlocked","module","slug","s","pro","id","build",
    "return","redirect","redirect_url","url","from","v"
  ];
  let current=null;
  try{document.documentElement.style.visibility="hidden"}catch(_){}
  const normalizePhone=value=>{
    const d=String(value||"").replace(/\D/g,"");
    return d.length===9?"221"+d:d;
  };
  const normalizeSlug=value=>String(value||"").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g,"-").replace(/[^a-z0-9._-]/g,"")
    .replace(/-+/g,"-").replace(/^[-_.]+|[-_.]+$/g,"");
  const normalizeModule=value=>String(value||"").trim().toUpperCase().replace(/[\s-]+/g,"_");
  const parseTime=value=>{
    if(value===null||value===undefined||value==="")return 0;
    if(typeof value==="number"&&Number.isFinite(value))return value<1e11?value*1000:value;
    const s=String(value).trim();
    if(!s)return 0;
    if(/^\d+$/.test(s)){const n=Number(s);return Number.isFinite(n)?(n<1e11?n*1000:n):0}
    const d=Date.parse(s);return Number.isFinite(d)?d:0;
  };
  const parse=raw=>{try{return JSON.parse(raw||"null")}catch(_){return null}};
  const read=(storage,key)=>{try{return storage.getItem(key)||""}catch(_){return ""}};
  const write=(storage,key,value)=>{try{storage.setItem(key,value)}catch(_){}};
  const remove=(storage,key)=>{try{storage.removeItem(key)}catch(_){}};

  function cleanUrl(){
    try{
      const url=new URL(location.href);let changed=false;
      SENSITIVE_KEYS.forEach(key=>{if(url.searchParams.has(key)){url.searchParams.delete(key);changed=true}});
      if(changed)history.replaceState({},document.title,url.pathname+url.search+url.hash);
    }catch(_){}
  }

  function validate(input){
    if(!input||typeof input!=="object")return null;
    const candidates=[input,input.session,input.state,input.data,input.payload].filter(v=>v&&typeof v==="object");
    for(const raw of candidates){
      const module=normalizeModule(raw.module||raw.module_code||raw.pin_module||"");
      const phone=normalizePhone(raw.phone||raw.owner_phone||raw.p_phone||"");
      const slug=normalizeSlug(raw.slug||raw.pro_slug||raw.build_slug||"");
      const validated=parseTime(raw.validated_at||raw.verified_at||raw.ts||0);
      const expires=parseTime(raw.expires_at||raw.access_until||raw.pin_access_until||0);
      const now=Date.now();
      if(!MODULE_ALIASES.has(module))continue;
      if(phone.length<9||!slug)continue;
      if(raw.access!==true||raw.access_ok!==true)continue;
      if(!validated||!expires)continue;
      if(validated>now+SKEW||now-validated>=TTL)continue;
      if(expires<=now||expires<validated||expires>validated+TTL+SKEW)continue;
      return {
        module:MODULE,slug,phone,owner_id:raw.owner_id||null,
        access:true,access_ok:true,
        pin_session_ok:raw.pin_session_ok===true,
        verified:raw.verified===true,
        validated_at:validated,verified_at:validated,expires_at:expires,
        session_token:String(raw.session_token||""),
        source:String(raw.source||"build_pin")
      };
    }
    return null;
  }

  function clear(){
    for(const storage of [sessionStorage,localStorage]){
      SESSION_KEYS.forEach(key=>remove(storage,key));
      IDENTITY_KEYS.forEach(key=>remove(storage,key));
    }
    current=null;
    try{delete window.DIGIY_ACCESS}catch(_){}
  }

  function persist(session){
    const clean=validate(session);
    if(!clean)return null;
    const raw=JSON.stringify(clean);
    SESSION_KEYS.forEach(key=>{write(sessionStorage,key,raw);write(localStorage,key,raw)});
    write(sessionStorage,"digiy_build_phone",clean.phone);
    write(sessionStorage,"DIGIY_BUILD_PHONE",clean.phone);
    remove(localStorage,"digiy_build_phone");
    remove(localStorage,"DIGIY_BUILD_PHONE");
    write(sessionStorage,"digiy_build_slug",clean.slug);
    write(localStorage,"digiy_build_slug",clean.slug);
    write(localStorage,"digiy_build_last_slug",clean.slug);
    write(localStorage,"DIGIY_BUILD_SLUG",clean.slug);
    current=clean;
    window.DIGIY_ACCESS={...clean};
    return clean;
  }

  function readStored(){
    for(const key of SESSION_KEYS){
      for(const storage of [sessionStorage,localStorage]){
        const raw=read(storage,key);
        if(!raw)continue;
        const valid=validate(parse(raw));
        if(valid)return persist(valid);
        remove(storage,key);
      }
    }
    return null;
  }

  function loginUrl(){
    try{
      const url=new URL(LOGIN_URL,location.href);url.search="";url.hash="";
      return url.origin===location.origin?url.pathname:url.toString();
    }catch(_){return "./pin.html"}
  }
  const show=()=>{try{document.documentElement.style.visibility=""}catch(_){}};
  const goLogin=()=>{clear();cleanUrl();location.replace(loginUrl())};
  const getSession=()=>{
    if(current){const valid=validate(current);if(valid)return valid}
    return readStored();
  };
  function boot(){
    cleanUrl();
    const session=readStored();
    if(!session){goLogin();return {ok:false,session:null,reason:"pin_required"}}
    show();return {ok:true,session,reason:"verified_pin_session"};
  }

  const filename=(location.pathname.split("/").pop()||"").toLowerCase();
  const isPin=filename==="pin.html"||filename==="pin";
  const state=isPin?{ok:false,session:null,reason:"pin_page"}:boot();
  const readyPromise=Promise.resolve(state);

  window.DIGIY_GUARD={
    VERSION:"build-guard-strict-pin8h-20260721",
    module:MODULE,state,
    ready:()=>readyPromise,
    getSession,
    require:()=>{const s=getSession();if(!s)goLogin();return s||{ok:false,access:false,access_ok:false,module:MODULE}},
    requireSession:async()=>{const s=getSession();if(!s){goLogin();return null}return s},
    logout:goLogin,clearSession:clear,cleanVisibleUrl:cleanUrl,buildLoginUrl:loginUrl
  };
  if(isPin)show();
})();
