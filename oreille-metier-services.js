/* DIGIY OREILLE MÉTIER — MES SERVICES / BUILD V1
   Le pro parle ou écrit court.
   DIGIY met en forme.
   Le pro valide.
   Le logiciel range.
*/
(function(){
  'use strict';

  const BUILD='oreille-metier-services-v1-conteneur-safe-20260519';

  let lastDraft=null;
  let recognition=null;
  let listening=false;

  const $=id=>document.getElementById(id);

  const esc=v=>String(v??'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');

  const strip=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const norm=v=>strip(String(v||'').toLowerCase()).replace(/[’']/g,' ').replace(/\s+/g,' ').trim();

  const toast=m=>{
    if(typeof window.showToast==='function'){
      window.showToast(m);
      return;
    }
    try{
      const n=document.createElement('div');
      n.textContent=m;
      n.style.cssText='position:fixed;left:14px;right:14px;bottom:92px;z-index:99999;padding:13px 15px;border-radius:18px;background:#062612;color:#f0fff5;border:1px solid rgba(250,204,21,.35);font:900 15px system-ui;box-shadow:0 16px 38px rgba(0,0,0,.28);';
      document.body.appendChild(n);
      setTimeout(()=>n.remove(),2600);
    }catch(_){
      alert(m);
    }
  };

  function money(text){
    const m=String(text||'').match(/(\d[\d\s.,]*)\s*(?:f|fcfa|francs?|xof|€|eur|euro)?/i);
    return m ? Number(String(m[1]).replace(/[^\d]/g,'')) || 0 : 0;
  }

  function parseDate(text){
    const t=norm(text);
    const d=new Date();
    const iso=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;

    if(t.includes('aujourd hui')) return iso(d);
    if(t.includes('demain')){ d.setDate(d.getDate()+1); return iso(d); }
    if(t.includes('apres demain') || t.includes('apres-demain')){ d.setDate(d.getDate()+2); return iso(d); }
    if(t.includes('fin du mois')) return iso(new Date(d.getFullYear(),d.getMonth()+1,0));

    const w={dimanche:0,lundi:1,mardi:2,mercredi:3,jeudi:4,vendredi:5,samedi:6};
    for(const [name,target] of Object.entries(w)){
      if(t.includes(name)){
        let add=(target-d.getDay()+7)%7;
        if(add===0) add=7;
        d.setDate(d.getDate()+add);
        return iso(d);
      }
    }

    const m=String(text||'').match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
    if(m){
      const y=m[3] ? Number(String(m[3]).length===2 ? '20'+m[3] : m[3]) : d.getFullYear();
      return iso(new Date(y,Number(m[2])-1,Number(m[1])));
    }
    return '';
  }

  function hasContact(text){
    const s=String(text||'');
    return /(?:tel|tél|telephone|téléphone|whatsapp|wa)\s*[:\-]?\s*[+0-9][0-9\s().-]{6,}/i.test(s)
      || /(?:\+?221)?\s*(7[05678])[\s.-]?(\d{3})[\s.-]?(\d{2})[\s.-]?(\d{2})/.test(s);
  }

  function cleanClient(text){
    const raw=String(text||'')
      .replace(/(?:tel|tél|telephone|téléphone|whatsapp|wa)\s*[:\-]?\s*[+0-9][0-9\s().-]{6,}/ig,' ')
      .replace(/\d[\d\s.,]*/g,' ');

    const stop=new Set('build service services client demande devis chantier travaux travail dépannage depannage réparation reparation installation entretien urgence prix montant acompte solde note rappel demain aujourd hui tel telephone téléphone whatsapp wa'.split(' '));

    for(const w of raw.replace(/[.,;:!?()]/g,' ').split(/\s+/).filter(Boolean)){
      const k=norm(w);
      if(k.length>=2 && !stop.has(k)) return w.charAt(0).toUpperCase()+w.slice(1);
    }
    return 'Client';
  }

  function cleanWork(text){
    return String(text||'')
      .replace(/\b(client|demande|devis|chantier|travaux|service|urgence|prix|montant|acompte|solde|demain|aujourd hui|tel|telephone|téléphone|whatsapp|wa|fcfa|francs|f)\b/gi,' ')
      .replace(/\d+/g,' ')
      .replace(/[.,;:!?]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function routeDraft(title,href,note){
    return { type:'route', title, href, note:note||'' };
  }

  function parse(text){
    const original=String(text||'').trim();
    const t=norm(original);
    if(!original) return null;

    if(/\b(hub|menu|portes|navigation)\b/.test(t)) return routeDraft('🧭 Ouvrir le HUB services','./hub.html','Retour aux pavés.');
    if(/\b(session|acces|accès|nettoyer|code pin|pin)\b/.test(t)) return routeDraft('🛡️ Ouvrir ma session','./session.html','Contrôler l’accès sans afficher les identifiants.');
    if(/\b(accueil|dashboard|tableau)\b/.test(t)) return routeDraft('🏠 Ouvrir l’accueil','./dashboard-pro.html','Retour à l’accueil Mes services.');
    if(/\b(service|cockpit|travail|gerer|gérer)\b/.test(t)) return routeDraft('🧰 Ouvrir mon service','./cockpit.html','Retour à la page de travail.');
    if(/\b(fiche|profil|profile|photo|zone|metier|métier|contact client|visibilite|visibilité)\b/.test(t)) return routeDraft('🪪 Ouvrir ma fiche service','./profile.html','Métier, zone, photo et lien public.');
    if(/\b(qr|code qr|partager|lien client)\b/.test(t)) return routeDraft('🔳 Ouvrir mon QR','./qr.html','Partager la fiche au client.');
    if(/\b(demandes?|clients?)\b/.test(t)) return routeDraft('📋 Ouvrir les demandes','./cockpit.html#demandes','Voir les demandes client.');
    if(/\b(notes?|note rapide|rappel|memo|mémo)\b/.test(t) && !/\d/.test(t)) return routeDraft('📝 Ouvrir les notes','./cockpit.html#quickBuildNote','Parole terrain et suivi.');

    if(/\b(pay|argent|paiement|acompte|solde|dette|depense|dépense|recette)\b/.test(t)){
      return {
        type:'payment',
        title:'💰 Préparer Mon Argent',
        href:'https://pro-pay.digiylyfe.com/admin.html',
        amount:money(original),
        date:parseDate(original),
        note:original
      };
    }

    if(/\b(devis|prix|chiffrer|chiffrage|estimation)\b/.test(t)){
      return {
        type:'quote',
        title:'🧾 Devis à préparer',
        client:cleanClient(original),
        work:cleanWork(original) || 'Travail à préciser',
        contact:hasContact(original),
        date:parseDate(original),
        amount:money(original),
        note:original
      };
    }

    if(/\b(chantier|travaux|intervention|installation|reparation|réparation|depannage|dépannage|urgence|entretien)\b/.test(t)){
      return {
        type:'job',
        title:'🧰 Chantier / intervention',
        client:cleanClient(original),
        work:cleanWork(original) || 'Intervention à préciser',
        contact:hasContact(original),
        date:parseDate(original),
        amount:money(original),
        urgent:/\b(urgence|urgent|vite|aujourd hui)\b/.test(t),
        note:original
      };
    }

    if(/\b(note|rappel|rappelle|a faire|à faire|message|demande)\b/.test(t)){
      return {
        type:'note',
        title:'📝 Note service',
        client:cleanClient(original),
        contact:hasContact(original),
        date:parseDate(original),
        amount:money(original),
        note:original
      };
    }

    return {
      type:'note',
      title:'📝 Note à préciser',
      client:cleanClient(original),
      contact:hasContact(original),
      date:parseDate(original),
      amount:money(original),
      note:original
    };
  }

  function saveDraftLocal(d){
    try{
      const key='digiy_build_oreille_notes';
      const list=JSON.parse(localStorage.getItem(key)||'[]');

      const row={
        id:Date.now(),
        date:new Date().toISOString(),
        type:d.type||'note',
        title:d.title||'Note service',
        client:d.client||'Client',
        work:d.work||'',
        contact:!!d.contact,
        dueDate:d.date||'',
        amount:Number(d.amount||0),
        urgent:!!d.urgent,
        text:d.note||''
      };

      list.unshift(row);
      localStorage.setItem(key,JSON.stringify(list.slice(0,100)));
      localStorage.setItem('digiy_build_oreille_last_note',JSON.stringify(row));

      try{
        const legacy=JSON.parse(localStorage.getItem('digiy_build_notes')||'[]');
        legacy.unshift(row);
        localStorage.setItem('digiy_build_notes',JSON.stringify(legacy.slice(0,100)));
      }catch(_){}
    }catch(_){}
  }

  function renderDraft(d){
    const box=$('digiyServicesDraft');
    const btn=$('digiyServicesValidate');
    if(!box || !btn) return;

    lastDraft=d;
    btn.disabled=!d;

    if(!d){
      box.innerHTML='<strong>Doctrine</strong><span>Le pro parle ou écrit. DIGIY met en forme. Le pro valide. Le logiciel range.</span>';
      return;
    }

    if(d.type==='route'){
      box.innerHTML=`<strong>${esc(d.title)}</strong><span>Chemin : ${esc(d.href)}</span><em>${esc(d.note||'Valide pour ouvrir la bonne porte.')}</em>`;
      return;
    }

    if(d.type==='quote' || d.type==='job'){
      box.innerHTML=`<strong>${esc(d.title)}</strong><span>Client : ${esc(d.client||'Client')}</span><span>Travail : ${esc(d.work||'à préciser')}</span><span>Contact : ${d.contact?'renseigné':'—'}</span><span>Date : ${esc(d.date||'à préciser')}</span><span>Montant : ${d.amount?esc(d.amount.toLocaleString('fr-FR'))+' F':'—'}</span><em>Valide pour garder la note service.</em>`;
      return;
    }

    if(d.type==='payment'){
      box.innerHTML=`<strong>${esc(d.title)}</strong><span>Montant entendu : ${d.amount?esc(d.amount.toLocaleString('fr-FR'))+' F':'à compléter'}</span><span>Trace gardée localement avant ouverture.</span><em>Valide pour ouvrir Mon Argent.</em>`;
      return;
    }

    box.innerHTML=`<strong>${esc(d.title)}</strong><span>Client : ${esc(d.client||'Client')}</span><span>Contact : ${d.contact?'renseigné':'—'}</span><span>Date : ${esc(d.date||'à préciser')}</span><span>Montant : ${d.amount?esc(d.amount.toLocaleString('fr-FR'))+' F':'—'}</span><em>Valide pour garder la note dans Mes services.</em>`;
  }

  function executeDraft(){
    const d=lastDraft;
    if(!d) return;

    if(d.type==='note' || d.type==='quote' || d.type==='job' || d.type==='payment'){
      saveDraftLocal(d);
    }

    if(d.type==='quote' || d.type==='job' || d.type==='note'){
      toast('📝 Note service gardée dans le logiciel.');
      try{
        if(typeof window.renderNotes==='function') window.renderNotes();
        if(typeof window.renderBuildMemory==='function') window.renderBuildMemory();
        const target=document.querySelector('#quickBuildNote');
        if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
      }catch(_){}
      return;
    }

    if(d.href){
      toast('🧭 Porte ouverte');
      setTimeout(()=>{ location.href=d.href; },160);
      return;
    }

    toast('Geste préparé.');
  }

  function startVoice(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const btn=$('digiyServicesMic');
    const input=$('digiyServicesInput');

    if(!SR){
      toast('Voix non disponible sur ce navigateur. Écris court, ça marche aussi.');
      return;
    }

    try{
      if(recognition && listening){
        recognition.stop();
        return;
      }

      recognition=new SR();
      recognition.lang='fr-FR';
      recognition.interimResults=false;
      recognition.maxAlternatives=1;

      recognition.onstart=()=>{
        listening=true;
        if(btn) btn.textContent='🎧 J’écoute…';
      };

      recognition.onend=()=>{
        listening=false;
        if(btn) btn.textContent='🎙️ Parler';
      };

      recognition.onerror=()=>{
        listening=false;
        if(btn) btn.textContent='🎙️ Parler';
        toast('Voix non comprise. Écris la phrase courte.');
      };

      recognition.onresult=e=>{
        const said=e?.results?.[0]?.[0]?.transcript||'';
        if(input && said){
          input.value=said;
          renderDraft(parse(said));
          toast('Phrase captée. Vérifie puis valide.');
        }
      };

      recognition.start();
    }catch(_){
      toast('Micro déjà ouvert ou navigateur bloqué.');
    }
  }

  function inject(){
    if($('digiyServicesEar')) return;

    const anchor =
      document.querySelector('.quickBuild') ||
      document.querySelector('#quickBuildNote') ||
      document.querySelector('.grid') ||
      document.querySelector('main') ||
      document.querySelector('.wrap') ||
      document.body;

    if(!anchor) return;

    const css=document.createElement('style');
    css.textContent=`
      .digiy-services-ear{margin:12px 0;padding:14px;border:2px solid rgba(250,204,21,.34);border-radius:22px;background:linear-gradient(160deg,rgba(255,255,255,.10),rgba(34,197,94,.08));box-shadow:0 14px 32px rgba(0,0,0,.24);display:grid;gap:10px;color:#ecfff4}
      .digiy-services-ear summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:1000;color:#fff8dc}
      .digiy-services-ear summary::-webkit-details-marker{display:none}
      .digiy-services-ear-title{font-size:19px;font-weight:1000;line-height:1.1}
      .digiy-services-ear-sub{margin-top:4px;font-size:14.5px;font-weight:950;color:rgba(236,255,244,.78);line-height:1.35}
      .digiy-services-ear-chevron{font-size:20px;color:#facc15;font-weight:1000}
      .digiy-services-ear[open] .digiy-services-ear-chevron{transform:rotate(180deg)}
      .digiy-services-ear-body{display:grid;gap:10px;margin-top:12px}
      .digiy-services-chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .digiy-services-chip{min-height:54px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);color:#ecfff4;padding:10px 11px;font-size:15px;font-weight:1000;text-align:center;cursor:pointer}
      .digiy-services-chip.gold{background:rgba(250,204,21,.13);border-color:rgba(250,204,21,.28);color:#fff1a8}
      .digiy-services-chip.green{background:rgba(34,197,94,.13);border-color:rgba(34,197,94,.28);color:#bbf7d0}
      .digiy-services-input-grid{display:grid;grid-template-columns:1fr .85fr;gap:10px;align-items:start}
      .digiy-services-ear textarea{width:100%;min-height:98px;border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:12px;font-size:18px;font-weight:950;color:#ecfff4;background:rgba(0,0,0,.20);resize:vertical;outline:none}
      .digiy-services-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
      .digiy-services-actions button{min-height:44px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);color:#ecfff4;padding:9px 12px;font-size:15px;font-weight:1000;cursor:pointer}
      .digiy-services-actions button.primary{background:#facc15;border-color:#eab308;color:#1a1200}
      .digiy-services-actions button.ok{background:#22c55e;border-color:#16a34a;color:#04160e}
      .digiy-services-actions button:disabled{opacity:.52;cursor:not-allowed}
      .digiy-services-draft{min-height:98px;border:1px solid rgba(255,255,255,.14);border-radius:16px;background:rgba(0,0,0,.18);padding:12px;display:grid;gap:5px;font-size:15px;line-height:1.4;color:rgba(236,255,244,.78);font-weight:950}
      .digiy-services-draft strong{color:#fff;font-size:18px;font-weight:1000}
      .digiy-services-draft em{color:#fff1a8;font-style:normal;font-weight:1000}
      @media(max-width:760px){.digiy-services-input-grid{grid-template-columns:1fr}.digiy-services-chips{grid-template-columns:1fr 1fr}}
      @media(max-width:520px){.digiy-services-ear-title{font-size:18px}.digiy-services-chip{font-size:14px;min-height:52px}.digiy-services-ear textarea{font-size:17px}.digiy-services-actions button{font-size:14.5px}}
    `;
    document.head.appendChild(css);

    const panel=document.createElement('details');
    panel.className='digiy-services-ear';
    panel.id='digiyServicesEar';
    panel.open=false;

    panel.innerHTML=`
      <summary>
        <span>
          <span class="digiy-services-ear-title">🎙️ Mes oreilles SERVICES</span>
          <span class="digiy-services-ear-sub">Tu parles ou tu écris. DIGIY met en forme. Le pro valide.</span>
        </span>
        <span class="digiy-services-ear-chevron">⌄</span>
      </summary>

      <div class="digiy-services-ear-body">
        <div class="digiy-services-chips">
          <button class="digiy-services-chip green" type="button" data-services-example="Client demande devis plomberie demain">🧾 Devis</button>
          <button class="digiy-services-chip" type="button" data-services-example="Chantier réparation urgence aujourd’hui">🧰 Chantier</button>
          <button class="digiy-services-chip gold" type="button" data-services-example="Acompte reçu 50000">💰 Acompte</button>
          <button class="digiy-services-chip" type="button" data-services-example="Ouvrir ma fiche">🪪 Ma fiche</button>
          <button class="digiy-services-chip" type="button" data-services-example="Voir les demandes">📋 Demandes</button>
          <button class="digiy-services-chip gold" type="button" data-services-example="Note client rappeler demain">📝 Note</button>
        </div>

        <div class="digiy-services-input-grid">
          <div>
            <textarea id="digiyServicesInput" placeholder="Ex. client demande devis plomberie demain / acompte reçu 50000 / chantier urgence aujourd’hui"></textarea>
            <div class="digiy-services-actions">
              <button id="digiyServicesMic" type="button">🎙️ Parler</button>
              <button class="primary" id="digiyServicesPrepare" type="button">⚡ Préparer</button>
              <button class="ok" id="digiyServicesValidate" type="button" disabled>✅ Valider</button>
              <button id="digiyServicesClear" type="button">Effacer</button>
            </div>
          </div>

          <div class="digiy-services-draft" id="digiyServicesDraft">
            <strong>Doctrine</strong>
            <span>Le pro parle ou écrit. DIGIY met en forme. Le pro valide. Le logiciel range.</span>
          </div>
        </div>
      </div>
    `;

    if(anchor.classList?.contains('quickBuild') || anchor.id==='quickBuildNote'){
      anchor.insertAdjacentElement('afterend',panel);
    }else if(anchor.classList?.contains('grid') || anchor.classList?.contains('wrap')){
      anchor.prepend(panel);
    }else{
      anchor.appendChild(panel);
    }

    $('digiyServicesMic')?.addEventListener('click',startVoice);
    $('digiyServicesPrepare')?.addEventListener('click',()=>renderDraft(parse($('digiyServicesInput')?.value||'')));
    $('digiyServicesValidate')?.addEventListener('click',executeDraft);
    $('digiyServicesClear')?.addEventListener('click',()=>{
      if($('digiyServicesInput')) $('digiyServicesInput').value='';
      renderDraft(null);
    });

    panel.querySelectorAll('[data-services-example]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const v=btn.getAttribute('data-services-example')||'';
        const input=$('digiyServicesInput');
        if(input) input.value=v;
        renderDraft(parse(v));
      });
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',inject);
  else inject();

  window.DIGIY_OREILLE_METIER_SERVICES={
    BUILD,
    parse,
    renderDraft,
    executeDraft
  };
})();
