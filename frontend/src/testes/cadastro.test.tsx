// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import {afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {TelaLogin} from '../telas/TelaLogin';
afterEach(cleanup);
it('cria conta e retorna ao login sem autenticar automaticamente',async()=>{
 const cadastrar=vi.fn().mockResolvedValue(undefined),autenticar=vi.fn();
 render(<TelaLogin cadastrar={cadastrar} autenticar={autenticar} concluir={vi.fn()} voltar={vi.fn()} demonstrativo={false}/>);
 fireEvent.click(screen.getByRole('button',{name:'Criar minha conta'}));
 for(const [label,value] of [['Seu nome','Pessoa'],['Nome do estabelecimento','Loja'],['E-mail','pessoa@example.invalid'],['Senha','Senha-teste-12345'],['Confirmar senha','Senha-teste-12345']]) fireEvent.change(screen.getByLabelText(label,{exact:true}),{target:{value}});
 fireEvent.click(screen.getByRole('button',{name:'Criar conta'}));
 await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Conta e estabelecimento criados'));
 expect(cadastrar).toHaveBeenCalledWith({name:'Pessoa',merchantName:'Loja',email:'pessoa@example.invalid',password:'Senha-teste-12345'});
 expect(autenticar).not.toHaveBeenCalled();
 expect(screen.getByLabelText('Senha',{exact:true})).toHaveValue('');
});
it('impede envio de senhas divergentes',async()=>{
 const cadastrar=vi.fn();render(<TelaLogin cadastrar={cadastrar} autenticar={vi.fn()} concluir={vi.fn()} voltar={vi.fn()} demonstrativo={false}/>);
 fireEvent.click(screen.getByRole('button',{name:'Criar minha conta'}));
 fireEvent.change(screen.getByLabelText('Senha',{exact:true}),{target:{value:'Senha-teste-12345'}});
 fireEvent.submit(screen.getByRole('button',{name:'Criar conta'}).closest('form')!);
 await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('As senhas precisam ser iguais'));
 expect(cadastrar).not.toHaveBeenCalled();
 expect(screen.getByLabelText('Confirmar senha',{exact:true})).toHaveAttribute('aria-invalid','true');
 expect(screen.getByLabelText('Confirmar senha',{exact:true})).toHaveAccessibleDescription('As senhas precisam ser iguais.');
 expect(screen.getByLabelText('E-mail',{exact:true})).toHaveAttribute('aria-invalid','false');
});

