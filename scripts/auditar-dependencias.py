#!/usr/bin/env python3
"""Consulta OSV para coordenadas públicas resolvidas. Não envia código ou credenciais."""
import argparse, json, pathlib, urllib.request, datetime, sys
p=argparse.ArgumentParser()
p.add_argument('--maven-tree',type=pathlib.Path)
p.add_argument('--gradle-list',type=pathlib.Path)
p.add_argument('--output',required=True,type=pathlib.Path)
a=p.parse_args(); packages=set()
if a.maven_tree:
 def walk(n):
  if n.get('groupId') and n.get('artifactId') and n.get('version') and n.get('groupId')!='br.com.avanade':
   packages.add((n['groupId']+':'+n['artifactId'],n['version']))
  for c in n.get('children',[]):walk(c)
 walk(json.loads(a.maven_tree.read_text(encoding='utf-8-sig')))
if a.gradle_list:
 for line in a.gradle_list.read_text(encoding='utf-8-sig').splitlines():
  parts=line.strip().split(':')
  if len(parts)==3 and parts[2]!='unspecified':packages.add((':'.join(parts[:2]),parts[2]))
if not packages:raise SystemExit('Inventário vazio; auditoria não executada.')
results=[]
for offset in range(0,len(packages),100):
 batch=sorted(packages)[offset:offset+100]
 request=urllib.request.Request('https://api.osv.dev/v1/querybatch',data=json.dumps({'queries':[{'package':{'ecosystem':'Maven','name':n},'version':v} for n,v in batch]}).encode(),headers={'Content-Type':'application/json'},method='POST')
 with urllib.request.urlopen(request,timeout=60) as response:body=json.load(response)
 if len(body.get('results',[]))!=len(batch):raise SystemExit('Resposta OSV incompleta; não declarar auditoria aprovada.')
 for (name,version),result in zip(batch,body['results']):
  if result.get('next_page_token'):raise SystemExit('OSV paginou resultados; requer revisão adicional.')
  results.append({'package':name,'version':version,'vulnerabilities':[x['id'] for x in result.get('vulns',[])]})
report={'source':'https://api.osv.dev/v1/querybatch','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'packages':len(results),'affectedPackages':sum(bool(x['vulnerabilities']) for x in results),'results':results,'limitations':'Consulta da base OSV no instante registrado; não prova ausência de vulnerabilidades desconhecidas. Inclui dependências de teste quando inventariadas.'}
a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:report[k] for k in ['packages','affectedPackages','checkedAt']}))
sys.exit(1 if report['affectedPackages'] else 0)

