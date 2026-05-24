/*
  DIGIY OREILLE MÉTIER — MES SERVICES
  Code interne : BUILD
  Moins d’écrits, plus de clics.
*/
(function(){
  "use strict";
  if(window.DIGIY_SERVICES_EAR_READY) return;
  window.DIGIY_SERVICES_EAR_READY = true;

  const BUILD="oreille-metier-services-20260521";
  const ROUTES={hub:"./hub.html", service:"./cockpit.html", fiche:"./profile.html", session:"./session.html", pay:"https://pro-pay.digiylyfe.com/admin.html?from=BUILD#payVoicePanel"};

  const TEXTS={
    hub:"Bienvenue dans Mes services by DIGIY. Ici, le professionnel ne devient pas secrétaire. Il clique, il parle, DIGIY prépare les mots, et le terrain valide.",
    service:"Dans Mon service, note simplement une demande client. Besoin, prix, urgence, acompte : DIGIY garde la trace et prépare l’action.",
    fiche:"Ta fiche service doit dire vite qui tu es, ce que tu fais, où tu travailles et comment te joindre directement.",
    session:"La session protège Mes services. Aucun téléphone ni identifiant sensible ne doit rester dans l’adresse."
  };

  function inject(){
    if(document.getElementById("digiyServicesEar")) return;
    const css=document.createElement("style");
    css.textContent=`
      #digiyServicesEar{position:fixed;left:12px;bottom:calc(86px + env(safe-area-inset-bottom,0px));z-index:99999;font-family:Outfit,system-ui,sans-serif}
      #digiyServicesEar .earMain{width:76px;height:76px;border-radius:50%;border:1px solid rgba(250,204,21,.38);background:radial-gradient(circle at 50% 38%,rgba(255,255,255,.10),transparent 45%),linear-gradient(135deg,#22c55e,#c4973f);box-shadow:0 18px 44px rgba(0,0,0,.30);font-weight:1000;color:#102014;display:grid;place-items:center;cursor:pointer}
      #digiyServicesEar .earMenu{position:absolute;left:86px;bottom:4px;width:236px;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px;border-radius:22px;border:1px solid rgba(255,255,255,.16);background:rgba(8,50,24,.95);box-shadow:0 18px 44px rgba(0,0,0,.30);opacity:0;pointer-events:none;transform:translateX(-8px) scale(.96);transition:.18s}
      #digiyServicesEar.open .earMenu{opacity:1;pointer-events:auto;transform:translateX(0) scale(1)}
      #digiyServicesEar button,#digiyServicesEar a{min-height:42px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#f0fff5;text-decoration:none;font-size:12px;font-weight:1000;display:flex;align-items:center;justify-content:center;text-align:center;padding:8px;cursor:pointer}
      #digiyServicesEar .gold{background:linear-gradient(135deg,#22c55e,#c4973f);color:#102014;border:0}
      @media(max-width:640px){#digiyServicesEar{left:10px;bottom:calc(84px + env(safe-area-inset-bottom,0px))}#digiyServicesEar .earMenu{left:0;bottom:84px;width:min(260px,calc(100vw - 20px))}}
    `;
    document.head.appendChild(css);
    const box=document.createElement("div");
    box.id="digiyServicesEar";
    box.innerHTML=`<button class="earMain" type="button" aria-label="Oreille DIGIY Mes services">🎧<br>DIGIY</button><div class="earMenu"><button class="gold" data-say>Écouter</button><button data-stop>Fermer</button><a href="${ROUTES.service}">Service</a><a href="${ROUTES.fiche}">Fiche</a><a href="${ROUTES.pay}">PAY</a><a href="${ROUTES.session}">Session</a></div>`;
    document.body.appendChild(box);
    const main=box.querySelector(".earMain");
    main.onclick=()=>box.classList.toggle("open");
    box.querySelector("[data-stop]").onclick=()=>{try{speechSynthesis.cancel()}catch(_){} box.classList.remove("open");};
    box.querySelector("[data-say]").onclick=()=>speak(pageText());
  }

  function pageText(){
    const p=(location.pathname.split("/").pop()||"hub.html").toLowerCase();
    if(p.includes("cockpit")) return TEXTS.service;
    if(p.includes("profile")||p.includes("fiche")) return TEXTS.fiche;
    if(p.includes("session")) return TEXTS.session;
    return TEXTS.hub;
  }

  function speak(text){
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang="fr-FR"; u.rate=.88; u.pitch=1.02; u.volume=1;
      speechSynthesis.speak(u);
      window.DIGIY_SERVICES_MEMORY?.addNote?.("Audio DIGIY écouté : " + text.slice(0,120), {source:"oreille-services", build:BUILD});
    }catch(_){}
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();

  window.DIGIY_SERVICES_EAR={version:BUILD,speak};
})();

