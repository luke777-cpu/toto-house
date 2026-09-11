(function(root){
'use strict';
const players=['아빠','엄마','가현','지용','영현'],game='pig-land-family30-v1',days=30;
const F=typeof module!=='undefined'?require('./engine.js'):root.Farm;
function key(player){return F.KEY+':'+game+':'+player;}
function assets(s){return s.money+s.food*2+s.tiles.reduce((v,t)=>v+(t?Math.floor(F.buildings[t.type].cost*(1+.7*(t.level-1)*t.level/2)*.4):0),0)+s.pigs.reduce((v,p)=>v+Math.round((90+Math.min(8,p.age)*20)*p.health/100),0);}
function fresh(player){if(!players.includes(player))throw Error('Unknown family member');let s=F.fresh();s.seed=20260911;s.league={player,rules:game,healthTotal:0,samples:0,initialAssets:assets(s),result:null};return s;}
function score(s){let l=s.league;if(!l)return null;let rewards=F.goals(s).filter(g=>s.rewards.includes(g.id)).reduce((a,g)=>a+g.reward,0);let sale=s.sold*100,profit=Math.max(0,Math.floor((assets(s)-l.initialAssets-rewards-s.grants*700)/10)),care=Math.round((l.samples?l.healthTotal/l.samples:0)*5),goals=s.rewards.length*150;return {sale,profit,care,goals,total:Math.min(999999,sale+profit+care+goals)};}
function afterDay(s){let l=s.league;if(!l||l.result)return false;l.healthTotal+=s.pigs.length?F.stats(s).health:0;l.samples++;if(s.day-1>=days){l.result={...score(s),finishedAt:new Date().toISOString(),submitted:false,pending:false};return true;}return false;}
function valid(s){return F.valid(s)&&s.league&&players.includes(s.league.player)&&s.league.rules===game&&Number.isFinite(s.league.healthTotal)&&Number.isInteger(s.league.samples)&&s.league.samples>=0&&s.league.samples<=30&&Number.isFinite(s.league.initialAssets);}
const api={players,game,days,key,assets,fresh,score,afterDay,valid};if(typeof module!=='undefined')module.exports=api;else root.League=api;
})(typeof window!=='undefined'?window:globalThis);
