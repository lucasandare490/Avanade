// @vitest-environment jsdom
import {StrictMode} from 'react';
import {act,renderHook,waitFor,cleanup} from '@testing-library/react';
import {afterEach,it,expect,vi} from 'vitest';
import {useConsultaRemota} from '../utilitarios/useConsultaRemota';
afterEach(cleanup);
it('StrictMode nÃ£o inicia a consulta descartada e recarregar continua funcionando',async()=>{
 const consultar=vi.fn().mockResolvedValue('valor');
 const {result}=renderHook(()=>useConsultaRemota('mesma-chave',consultar),{wrapper:StrictMode});
 await waitFor(()=>expect(result.current.dados).toBe('valor'));
 expect(consultar).toHaveBeenCalledTimes(1);
 act(()=>result.current.recarregar());
 await waitFor(()=>expect(consultar).toHaveBeenCalledTimes(2));
});
it('desmontar antes da microtarefa nÃ£o envia a consulta',async()=>{
 const consultar=vi.fn().mockResolvedValue('valor');
 const {unmount}=renderHook(()=>useConsultaRemota('chave',consultar));
 unmount();await Promise.resolve();await Promise.resolve();
 expect(consultar).not.toHaveBeenCalled();
});
