/* ============================================================
   DIGIY BUILD — Actions terrain rapides
   Greffe légère pour cockpit.html
   Doctrine : Le pro clique plus qu’il n’écrit.
   DIGIY prépare. L’artisan valide. Le client comprend.
   ============================================================ */

(function(){
  "use strict";

  const ACTIONS = [
    {
      icon: "🧱",
      title: "Nouveau chantier",
      text: "Nouveau chantier à préparer : préciser le lieu, le type de travaux, l’urgence, le matériel possible, la main-d’œuvre et l’acompte éventuel."
    },
    {
      icon: "🔧",
      title: "Réparation",
      text: "Réparation à préparer : décrire la panne, le lieu, le niveau d’urgence, le matériel à prévoir et le prix estimé avant validation client."
    },
    {
      icon: "🚿",
      title: "Plomberie",
      text: "Intervention plomberie : fuite, robinet, WC, évacuation ou dépannage. Prévoir diagnostic, matériel, main-d’œuvre et déplacement."
    },
    {
      icon: "⚡",
      title: "Électricité",
      text: "Intervention électricité : panne, prise, éclairage, tableau ou installation. Vérifier sécurité, matériel nécessaire, main-d’œuvre et délai."
    },
    {
      icon: "🎨",
      title: "Peinture",
      text: "Travaux peinture : surface à traiter, préparation mur, nombre de couches, matériel, main-d’œuvre, délai et prix estimé."
    },
    {
      icon: "🏠",
      title: "Rénovation",
      text: "Rénovation maison ou pièce : lister les travaux, matériaux, étapes, délai, acompte, main-d’œuvre et validation client."
    },
    {
      icon: "📋",
      title: "Pré-devis",
      text: "Pré-devis à préparer : besoin du client, lieu, matériel, main-d’œuvre, déplacement, délai, acompte et reste à payer. DIGIY prépare, l’artisan valide."
    },
    {
      icon: "💰",
      title: "Acompte reçu",
      text: "Acompte reçu client : noter montant, moyen de paiement, chantier concerné et reste à payer."
    },
    {
      icon: "📦",
      title: "Achat matériel",
      text: "Achat matériel chantier : noter article, montant, lieu d’achat, moyen de paiement et chantier concerné."
    },
    {
      icon: "👷",
      title: "Main-d’œuvre",
      text: "Main-d’œuvre payée : noter personne, montant, chantier, jour travaillé et moyen de paiement."
    }
  ];

  function el(tag, className, html){
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function injectStyles(){
    if (document.getElementById("digiyBuildActionsStyle")) return;

    const style = el("style");
    style.id = "digiyBuildActionsStyle";
    style.textContent = `
      .digiyBuildActions{
        margin-top:12px;
        border:1px solid rgba(250,204,21,.24);
        border-radius:22px;
        padding:14px;
        background:
          radial-gradient(500px 220px at 100% 0%, rgba(250,204,21,.12), transparent 70%),
          linear-gradient(145deg,rgba(11,42,31,.92),rgba(6,35,25,.92));
        box-shadow:0 18px 55px rgba(0,0,0,.35);
      }
      .digiyBuildActionsHead{
        display:flex;
        justify-content:space-between;
        gap:12px;
        flex-wrap:wrap;
        align-items:flex-start;
        margin-bottom:12px;
      }
      .digiyBuildActionsKicker{
        font-size:12px;
        font-weight:1000;
        letter-spacing:.05em;
        text-transform:uppercase;
        color:#fde68a;
      }
      .digiyBuildActionsTitle{
        margin-top:5px;
        font-size:20px;
        font-weight:1000;
        line-height:1.08;
      }
      .digiyBuildActionsText{
        margin-top:6px;
        color:rgba(234,255,241,.76);
        font-size:13px;
        font-weight:800;
        line-height:1.45;
        max-width:76ch;
      }
      .digiyBuildDoctrine{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:38px;
        padding:9px 12px;
        border-radius:999px;
        border:1px solid rgba(34,197,94,.28);
        background:rgba(34,197,94,.12);
        color:#bbf7d0;
        font-size:12px;
        font-weight:1000;
        white-space:normal;
      }
      .digiyBuildActionGrid{
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:9px;
      }
      .digiyBuildActionBtn{
        min-height:78px;
        border-radius:16px;
        border:1px solid rgba(255,255,255,.15);
        background:rgba(0,0,0,.18);
        color:var(--text,#eafff1);
        cursor:pointer;
        padding:10px;
        font-family:inherit;
        font-weight:1000;
        text-align:left;
        display:flex;
        flex-direction:column;
        gap:6px;
        justify-content:center;
        transition:transform .14s ease,border-color .14s ease,background .14s ease;
      }
      .digiyBuildActionBtn:hover{
        transform:translateY(-1px);
        border-color:rgba(250,204,21,.55);
        background:rgba(250,204,21,.10);
      }
      .digiyBuildActionBtn span:first-child{font-size:22px;line-height:1}
      .digiyBuildActionBtn span:last-child{font-size:12px;line-height:1.18}
      @media(max-width:900px){
        .digiyBuildActionGrid{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media(max-width:620px){
        .digiyBuildActionGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .digiyBuildActionsTitle{font-size:18px}
      }
    `;
    document.head.appendChild(style);
  }

  function fillQuickNote(text){
    const input = document.getElementById("quickBuildInput");
    if (!input) return;

    input.value = text;
    input.focus();

    const target = document.getElementById("quickBuildNote") || input;
    try {
      target.scrollIntoView({ behavior:"smooth", block:"center" });
    } catch(_) {
      location.hash = "#quickBuildNote";
    }

    const prepare = document.getElementById("btnQuickBuildPrepare");
    if (prepare && typeof prepare.click === "function") {
      setTimeout(() => prepare.click(), 120);
    }
  }

  function addExtraExamples(){
    const box = document.getElementById("quickBuildExamples");
    if (!box || box.dataset.digiyBuildPlus === "1") return;

    box.dataset.digiyBuildPlus = "1";

    [
      "Pré-devis rénovation salon",
      "Acompte reçu 25000 Wave",
      "Achat peinture 18000",
      "Client doit reste 30000",
      "Main d’œuvre chantier 15000"
    ].forEach((label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => fillQuickNote(label));
      box.prepend(b);
    });
  }

  function updateIntroText(){
    const service = document.getElementById("service");
    if (!service || service.dataset.digiyBuildIntro === "1") return;

    service.dataset.digiyBuildIntro = "1";

    const muted = service.querySelector(".muted");
    if (muted) {
      muted.innerHTML =
        "Ici tu poses un devis, suis une demande, notes une dépense ou un acompte, puis tu gardes la trace propre.<br><b style='color:#fde68a'>DIGIY prépare. L’artisan valide. Le client comprend.</b>";
    }
  }

  function render(){
    if (document.getElementById("digiyBuildActions")) return;

    injectStyles();
    updateIntroText();
    addExtraExamples();

    const workspace = document.getElementById("workspace");
    const demandes = document.getElementById("demandes");
    const parent = workspace || demandes?.parentNode || document.querySelector(".wrap");
    if (!parent) return;

    const card = el("section", "digiyBuildActions");
    card.id = "digiyBuildActions";
    card.innerHTML = `
      <div class="digiyBuildActionsHead">
        <div>
          <div class="digiyBuildActionsKicker">BUILD · gestes chantier</div>
          <div class="digiyBuildActionsTitle">Le pro clique, DIGIY prépare la trace.</div>
          <div class="digiyBuildActionsText">
            Choisis le geste terrain. DIGIY remplit une note propre : devis, réparation, matériel,
            acompte, main-d’œuvre ou reste à payer.
          </div>
        </div>
        <div class="digiyBuildDoctrine">DIGIY prépare · l’artisan valide · le client comprend</div>
      </div>
      <div class="digiyBuildActionGrid" id="digiyBuildActionGrid"></div>
    `;

    if (workspace && demandes) {
      workspace.insertBefore(card, demandes);
    } else {
      parent.appendChild(card);
    }

    const grid = document.getElementById("digiyBuildActionGrid");
    ACTIONS.forEach((action) => {
      const btn = el("button", "digiyBuildActionBtn");
      btn.type = "button";
      btn.innerHTML = `<span>${action.icon}</span><span>${action.title}</span>`;
      btn.addEventListener("click", () => fillQuickNote(action.text));
      grid.appendChild(btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
