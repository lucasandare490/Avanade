#!/usr/bin/env python3
"""Real HTTP acceptance with synthetic data; requires running demo and DEMO_PASSWORD."""
import argparse, json, os, pathlib, urllib.request, urllib.error, uuid
parser=argparse.ArgumentParser();parser.add_argument('--recover',action='store_true');args=parser.parse_args()
base=os.environ.get('API_URL','http://127.0.0.1:8080')
root=pathlib.Path(__file__).resolve().parents[1];state=root/'.local/smoke-state.json'
def request(method,path,data=None,token=None,key=None):
    headers={'Content-Type':'application/json'}
    if token: headers['Authorization']='Bearer '+token
    if key: headers['Idempotency-Key']=key
    req=urllib.request.Request(base+path,data=None if data is None else json.dumps(data).encode(),headers=headers,method=method)
    with urllib.request.urlopen(req,timeout=20) as response:
        raw=response.read();return response.status,json.loads(raw) if raw else None
_,session=request('POST','/api/v1/auth/login',{'email':'gerente1@demo.local','password':os.environ['DEMO_PASSWORD']})
token=session['accessToken']
if args.recover:
    previous=json.loads(state.read_text())
    _,recovered=request('GET','/api/v1/requests/SALE/'+previous['key'],token=token)
    assert recovered==previous['response'], 'Persisted response differs after restart'
    print('PASS: same sale, operation, parcels and events recovered after restart')
else:
    key=str(uuid.uuid4());payload={'amountCents':15000,'currency':'BRL','paymentMethod':'PIX','taxCategory':'GENERAL'}
    status,sale=request('POST','/api/v1/sales',payload,token,key);assert status==201
    assert sale['operation']['netCents']==13200 and sale['operation']['status']=='CONCLUIDA'
    status,replay=request('POST','/api/v1/sales',payload,token,key);assert status==200 and replay==sale
    _,recovered=request('GET','/api/v1/requests/SALE/'+key,token=token);assert recovered==sale
    _,detail=request('GET','/api/v1/split-operations/'+sale['operation']['id'],token=token);assert detail==sale['operation']
    state.parent.mkdir(exist_ok=True);state.write_text(json.dumps({'key':key,'response':sale},indent=2));state.chmod(0o600)
    examples=root/'docs/examples';examples.mkdir(exist_ok=True)
    (examples/'sale-confirmed.json').write_text(json.dumps(sale,ensure_ascii=False,indent=2)+'\n')
    _,spec=request('GET','/v3/api-docs');(root/'docs/openapi.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
    print('PASS: HTTP sale 15000 = 1500 tax + 300 fee + 13200 net; replay and recovery identical')
request('POST','/api/v1/auth/logout',token=token)
