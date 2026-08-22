import{t as Ac}from"./main-U72BAIAZ.js";function b(i){return{filename:`${(i.title.trim()||`Untitled`).replace(/[\\/:*?"<>|]/g,`_`)}.txt`,content:Ac(i.body)}}function g(i){let e=`# Lichen Notes Export
# version: 1

`;for(let n of i)e+=`---
`,e+=`id: ${n.id}
`,e+=`createdAt: ${n.created_at}
`,e+=`updatedAt: ${n.updated_at}
`,e+=`---

`,e+=`# ${n.title}
`,e+=`${Ac(n.body)}

`;return e}function k(i){return i.replace(/\.txt$/i,``).trim()||`Untitled`}function y(i,e){let n=i.split(`
`);if(e<0||e>=n.length)return i;let t=n[e];return t.includes(`- [ ]`)?n[e]=t.replace(`- [ ]`,`- [x]`):t.includes(`- [x]`)&&(n[e]=t.replace(`- [x]`,`- [ ]`)),n.join(`
`)}var L=4;function h(i){let e=``;for(let t of i)if(t===` `||t===`	`)e+=t;else break;let n=``;for(let t of e)n+=t===`	`?` `.repeat(L):` `;return n}function W(i){let e=i.split(`
`),n=[],t=0;for(;t<e.length;){let r=e[t];if(r.trim()===`---`){n.push({type:`divider`,startLine:t,endLine:t}),t++;continue}if(r.trimStart().startsWith(`#`)){let s=r.trimStart(),o=0;for(;s[o]===`#`;)o++;let c=s.slice(o).trimStart();n.push({type:`heading`,level:Math.min(o,3),text:c,startLine:t,endLine:t}),t++;continue}if(r.trimStart().startsWith(`- [`)){let s=[],o=t;for(;t<e.length&&e[t].trimStart().startsWith(`- [`);){let c=e[t],a=h(c),l=c.trimStart(),m=l.startsWith(`- [x]`),x=l.replace(/^- \[x\] /,``).replace(/^- \[ \] /,``);s.push({text:a+x,checked:m,lineIndex:t}),t++}n.push({type:`checklist`,items:s,startLine:o,endLine:t-1});continue}if(/^\d+\.\s/.test(r.trimStart())){let s=[],o=t;for(;t<e.length&&/^\d+\.\s/.test(e[t].trimStart());)s.push({text:e[t],checked:!1,lineIndex:t}),t++;n.push({type:`numberedList`,items:s,startLine:o,endLine:t-1});continue}if(r.trimStart().startsWith(`- `)){let s=[],o=t,c=h(r).length;for(;t<e.length;){let a=e[t];if(!a.trimStart().startsWith(`- `))break;let l=h(a).length;if(l<c)break;let m=a.trimStart().replace(/^- /,``);s.push(` `.repeat(l)+m),t++}n.push({type:`bulletList`,items:s,startLine:o,endLine:t-1});continue}let f=t,p=[];for(;t<e.length&&e[t].trim()!==``&&!e[t].trimStart().startsWith(`- [`)&&!e[t].trimStart().startsWith(`- `)&&!e[t].trimStart().startsWith(`#`)&&!/^\d+\.\s/.test(e[t].trimStart())&&e[t].trim()!==`---`;)p.push(e[t]),t++;let u=p.join(`
`).trimEnd();u.trim()!==``?n.push({type:`text`,text:u,startLine:f,endLine:t-1}):t++}return n}function E(i,e){let n=new Blob([e],{type:`text/plain`}),t=URL.createObjectURL(n),r=document.createElement(`a`);r.href=t,r.download=i,r.click(),URL.revokeObjectURL(t)}export{k as a,g as i,W as n,y as o,b as r,E as t};