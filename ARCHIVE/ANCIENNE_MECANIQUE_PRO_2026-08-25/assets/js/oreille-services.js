/* DIGIYLYFE — OREILLE MES SERVICES / BUILD
   Fichier : assets/js/oreille-services.js
   Dépendance : assets/js/oreille-metier-core.js
   Doctrine : l’Oreille prépare, DIGIY formule, le pro valide, Mes services range.
   Rien n’est confirmé automatiquement : ni devis, ni prix, ni rendez-vous, ni chantier, ni promesse client.
*/
(function(){
  'use strict';
  var VERSION='oreille-services-v1-20260524';

  var GUIDE='Bienvenue dans Oreille Mes services DIGIYLYFE. Ici, l’artisan ou le professionnel de service peut parler ou cliquer pour préparer une demande client, un devis, une note chantier, un rendez-vous, une relance, un acompte ou un message WhatsApp. DIGIY aide à préciser le client, le téléphone, le métier, le lieu, l’urgence, le prix proposé, l’acompte, le solde, le matériel, la date et la prochaine action. Mais Mes services ne confirme jamais seul un devis, un prix, un rendez-vous, un chantier, un acompte ou une promesse client. Le professionnel vérifie, modifie et valide. L’Oreille prépare. DIGIY formule. Le pro valide. Le logiciel range. Le terrain garde la main.';
  var TEMPLATES=[
    '📩 Nouvelle demande — client · téléphone · service demandé · lieu · urgence.',
    '🧾 Devis à préparer — service · matériel · main-d’œuvre · prix proposé · validité.',
    '🛠️ Note chantier — lieu · tâche · matériel · difficulté · prochaine action.',
    '📅 Rendez-vous à proposer — client · lieu · date · heure · durée estimée.',
    '💰 Acompte / solde — montant · mode de paiement · preuve à vérifier.',
    '📲 Message WhatsApp — remercier · reformuler la demande · demander les infos manquantes.',
    '🧍 Client à rappeler — nom · téléphone · motif · moment idéal.',
    '⚠️ Brouillon — garder la trace sans confirmer prix, devis ou rendez-vous.'
  ];

  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  function core(){return window.DigiyOreilleMetier||null;}
  function norm(v){var c=core();return c&&c.normalizeText?c.normalizeText(v):String(v||'').replace(/\s+/g,' ').trim();}
  function low(v){return norm(v).toLowerCase();}
  function field(text,labels){
    var clean=norm(text);
    for(var i=0;i<labels.length;i++){
      var label=labels[i];
      var re=new RegExp('(?:^|[\\s;,.|—-])'+label+'\\s*[:\\-]?\\s*([^;|\\n]+?)(?=\\s+(?:client|nom|tel|tél|telephone|téléphone|service|métier|metier|lieu|adresse|zone|urgence|prix|tarif|montant|devis|acompte|solde|matériel|materiel|date|heure|rendez-vous|rdv|message|statut|note)\\s*[:\\-]|$)','i');
      var m=clean.match(re);if(m&&m[1])return norm(m[1]);
    }
    return '';
  }
  function phone(text){var clean=norm(text);var e=clean.match(/(?:tel|tél|telephone|téléphone|phone|whatsapp|wa|numéro|numero)\s*[:\-]?\s*((?:\+?\d[\d\s().-]{6,}\d))/i);if(e&&e[1])return norm(e[1]);var any=clean.match(/(?:\+?\d[\d\s().-]{7,}\d)/);return any?norm(any[0]):'';}
  function client(text){var x=field(text,['client','nom','personne']);if(x)return x;var m=norm(text).match(/\b(?:client|pour|chez|avec|madame|monsieur|m\.|mme)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s'.-]{1,45})/i);if(m&&m[1])return norm(m[1]).replace(/\b(?:tel|service|lieu|prix|devis|rdv|rendez-vous)\b.*$/i,'').trim();return '';}
  function service(text){var x=field(text,['service','métier','metier','travail','prestation','tâche','tache']);if(x)return x;var t=low(text);var jobs=['plomberie','plombier','électricité','electricite','électricien','electricien','peinture','peintre','maçonnerie','maconnerie','maçon','macon','menuiserie','menuisier','climatisation','clim','nettoyage','jardinage','carrelage','réparation','reparation','dépannage','depannage'];for(var i=0;i<jobs.length;i++){if(t.indexOf(jobs[i])!==-1)return jobs[i];}return '';}
  function place(text){return field(text,['lieu','adresse','zone','quartier','chantier','maison','villa','appartement']);}
  function urgency(text){var x=field(text,['urgence','priorité','priorite','délai','delai']);if(x)return x;var t=low(text);if(/urgent|vite|aujourd'hui|maintenant|immédiat|immediat/.test(t))return 'urgent';if(/demain|cette semaine|semaine/.test(t))return 'à planifier';return '';}
  function money(text,labels){var x=field(text,labels||['prix','tarif','montant','devis']);if(x)return x;var m=norm(text).match(/\b(\d[\d\s.,]*)\s*(fcfa|f\s*cfa|xof|cfa|€|eur|euro|euros|f)\b/i);return m?norm(m[1]+' '+(m[2]||'')):'';}
  function dateValue(text){var x=field(text,['date','jour','rendez-vous','rdv']);if(x)return x;var m=norm(text).match(/\b(aujourd'hui|demain|après-demain|apres-demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{2,4})?)\b/i);return m?m[1]:'';}
  function timeValue(text){var x=field(text,['heure']);if(x)return x;var m=norm(text).match(/\b(\d{1,2})\s*h\s*(\d{2})?\b/i);return m?m[0]:'';}
  function material(text){return field(text,['matériel','materiel','fournitures','outil','outils','pièces','pieces']);}
  function intent(text){var t=low(text);if(/devis|prix|tarif|montant/.test(t))return 'devis à préparer';if(/rdv|rendez-vous|date|heure|passer|venir/.test(t))return 'rendez-vous à proposer';if(/acompte|solde|paiement|payé|paye|wave|cash/.test(t))return 'paiement à vérifier';if(/chantier|matériel|materiel|travaux|réparation|reparation|dépannage|depannage/.test(t))return 'note chantier';if(/whatsapp|message|répondre|repondre|sms/.test(t))return 'message client';if(/rappeler|relance|appeler/.test(t))return 'client à rappeler';if(/demande|client|service|besoin/.test(t))return 'demande service';return 'brouillon Mes services';}
  function draft(text){var clean=norm(text);return{module:'BUILD',visible_module:'Mes services',original:clean,intent:intent(clean),client_name:client(clean),client_phone:phone(clean),service:service(clean),place:place(clean),urgency:urgency(clean),price:money(clean,['prix','tarif','montant','devis']),deposit:money(clean,['acompte','avance']),balance:money(clean,['solde','reste','reste à payer','reste a payer']),date:dateValue(clean),time:timeValue(clean),material:material(clean)};}
  function missing(d){var miss=[];if(!d.client_name)miss.push('client');if(!d.client_phone)miss.push('téléphone');if(!d.service)miss.push('service demandé');if(!d.place&&/lieu|adresse|chantier|venir|rdv|rendez-vous/.test(low(d.original)))miss.push('lieu');if(!d.price&&/devis|prix|tarif|montant|acompte|solde/.test(low(d.original)))miss.push('prix/montant');if(!d.date&&/rdv|rendez-vous|date|passer|venir/.test(low(d.original)))miss.push('date');return miss;}
  function line(label,value){return value?'\n- '+label+' : '+value:'';}
  function formulate(text){
    var clean=norm(text);if(!clean)return 'Mes services · Note vide : préciser la demande avant validation.';
    var d=draft(clean),miss=missing(d);
    var out='MES SERVICES · '+d.intent.toUpperCase()+'\nBrouillon préparé à partir de : '+clean+line('Client',d.client_name)+line('Téléphone',d.client_phone)+line('Service',d.service)+line('Lieu',d.place)+line('Urgence',d.urgency)+line('Date',d.date)+line('Heure',d.time)+line('Prix / devis',d.price)+line('Acompte',d.deposit)+line('Solde',d.balance)+line('Matériel',d.material);
    if(miss.length)out+='\nÀ compléter avant validation : '+miss.join(', ')+'.';
    out+='\nÀ vérifier par le professionnel avant envoi ou rangement. Aucun devis, prix, rendez-vous, paiement, chantier ou promesse client n’est confirmé automatiquement.';
    return out;
  }
  function extra(text){return{services_draft:draft(text),status:'draft',warning:'Brouillon Mes services : validation humaine obligatoire avant devis, prix, rendez-vous, paiement ou promesse client.'};}

  ready(function(){
    var c=core();var target=document.querySelector('#digiy-oreille-services')||document.querySelector('#digiy-oreille-metier')||document.querySelector('[data-digiy-oreille]');
    if(!c||!target){console.warn('[DIGIY SERVICES] Core ou cible Oreille manquant.');return;}
    var instance=c.mount({module:'BUILD',title:'Oreille Mes services',subtitle:'Demande · devis · chantier · rendez-vous · acompte · message client.',storagePrefix:'DIGIY_OREILLE_METIER',target:target,guideText:GUIDE,templates:TEMPLATES,formulate:formulate,buildSaveExtra:extra});
    window.DIGIY_OREILLE_SERVICES={version:VERSION,instance:instance,buildDraft:draft,formulate:formulate,missingFields:missing};
  });
})();