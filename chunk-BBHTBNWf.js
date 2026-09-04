import{n as ge}from"./main-65MTLQ5M.js";function S(c,e){let n=c.split(`
`);if(e<0||e>=n.length)return c;let t=n[e];return t.includes(`- [ ]`)?n[e]=t.replace(`- [ ]`,`- [x]`):t.includes(`- [x]`)&&(n[e]=t.replace(`- [x]`,`- [ ]`)),n.join(`
`)}var L=4;function m$1(c){let e=``;for(let t of c)if(t===` `||t===`	`)e+=t;else break;let n=``;for(let t of e)n+=t===`	`?` `.repeat(L):` `;return n}function g(c){let e=c.split(`
`),n=[],t=0;for(;t<e.length;){let r=e[t];if(r.trim()===`---`){n.push({type:`divider`,startLine:t,endLine:t}),t++;continue}if(r.trimStart().startsWith(`#`)){let i=r.trimStart(),s=0;for(;i[s]===`#`;)s++;let a=i.slice(s).trimStart();n.push({type:`heading`,level:Math.min(s,3),text:a,startLine:t,endLine:t}),t++;continue}if(r.trimStart().startsWith(`- [`)){let i=[],s=t;for(;t<e.length&&e[t].trimStart().startsWith(`- [`);){let a=e[t],o=m$1(a),l=a.trimStart(),h=l.startsWith(`- [x]`),f=l.replace(/^- \[x\] /,``).replace(/^- \[ \] /,``);i.push({text:o+f,checked:h,lineIndex:t}),t++}n.push({type:`checklist`,items:i,startLine:s,endLine:t-1});continue}if(/^\d+\.\s/.test(r.trimStart())){let i=[],s=t;for(;t<e.length&&/^\d+\.\s/.test(e[t].trimStart());)i.push({text:e[t],checked:!1,lineIndex:t}),t++;n.push({type:`numberedList`,items:i,startLine:s,endLine:t-1});continue}if(r.trimStart().startsWith(`- `)){let i=[],s=t,a=m$1(r).length;for(;t<e.length;){let o=e[t];if(!o.trimStart().startsWith(`- `))break;let l=m$1(o).length;if(l<a)break;let h=o.trimStart().replace(/^- /,``);i.push(` `.repeat(l)+h),t++}n.push({type:`bulletList`,items:i,startLine:s,endLine:t-1});continue}let d=t,p=[];for(;t<e.length&&e[t].trim()!==``&&!e[t].trimStart().startsWith(`- [`)&&!e[t].trimStart().startsWith(`- `)&&!e[t].trimStart().startsWith(`#`)&&!/^\d+\.\s/.test(e[t].trimStart())&&e[t].trim()!==`---`;)p.push(e[t]),t++;let u=p.join(`
`).trimEnd();u.trim()!==``?n.push({type:`text`,text:u,startLine:d,endLine:t-1}):t++}return n}function c(e){return{filename:`${(e.title.trim()||`Untitled`).replace(/[\\/:*?"<>|]/g,`_`)}.txt`,content:ge(e.body)}}function a(e){let t=`# Lichen Notes Export
# version: 1

`;for(let n of e)t+=`---
`,t+=`id: ${n.id}
`,t+=`createdAt: ${n.created_at}
`,t+=`updatedAt: ${n.updated_at}
`,t+=`---

`,t+=`# ${n.title}
`,t+=`${ge(n.body)}

`;return t}function d(e){return e.replace(/\.txt$/i,``).trim()||`Untitled`}function m(e,t){let n=new Blob([t],{type:`text/plain`}),i=URL.createObjectURL(n),o=document.createElement(`a`);o.href=i,o.download=e,o.click(),URL.revokeObjectURL(i)}export{S as a,m as i,c as n,g as o,d as r,a as t};