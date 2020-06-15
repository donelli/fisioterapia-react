import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonToast, IonList, IonListHeader, IonItem, IonLabel, IonInput, IonDatetime, IonSelect, IonSelectOption, IonToggle, IonRow, IonCol, IonButton, IonSpinner } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { checkmarkSharp, at } from 'ionicons/icons';
import { getKeyNovoFisioterapeuta, cadastrarFisioterapeuta, buscaFisioterapeutaPorEmail, buscaFisioterapeutaPorId, timestampToDate, getUserFromAuthBase } from '../config/firebase';
import { addUserToAuthBase, deleteUserFromAuthBase } from './../config/firebase';

interface FisioterapeutaProps extends RouteComponentProps<{
  id: string;
}> {}

const CadastroFisioterapeuta: React.FC<FisioterapeutaProps> = (props) => {
  
  let novoCadastro = props.match.params.id === 'novo';
  let routeName = novoCadastro ? 'Novo fisioterapeuta' : 'Editar fisioterapeuta';
  let id = props.match.params.id;
  
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [sexo, setSexo] = useState<'f' | 'm'>('f');
  const [cpf, setCpf] = useState<string>('');
  const [endereco, setEndereco] = useState<string>('');
  const [cep, setCep] = useState<string>('');
  const [ativo, setAtivo] = useState<boolean>(false);
  const [nascimento, setNascimento] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [gravando, setGravando] = useState<boolean>(false);
  const [erroCadastro, setErroCadastro] = useState<string>('');
  const [idAnterior, setIdAnterior] = useState<string>('');
  
  if (!idAnterior || idAnterior !== id) {
    
    setCarregando(false);
    setGravando(false);
    
    setNome('');
    setEmail('');
    setSexo('f');
    // setSenha('');
    setCpf('');
    setCep('');
    setNascimento('');
    setEndereco('');
    setAtivo(true);
    
    if (!novoCadastro) {
      carregaFisioterapeuta();
    }
    
    setIdAnterior(id);
    
  }
  
  useEffect(function() {
    
    if (!nome) {
      setErroCadastro('Nome deve ser preenchido!');
      return;
    }
    
    if (!email) {
      setErroCadastro('E-mail deve ser preenchido!');
      return
    } else {
      if (!validaEmail(email)) {
        setErroCadastro('E-mail invalido!');
        return;
      }
    }
    
    if (!nascimento) {
      setErroCadastro('Data de nascimento invalida!');
      return;
    }
    
    if (!cpf || !validaCpf(cpf)) {
      setErroCadastro('CPF invalido!');
      return;
    }
    
    if (!endereco) {
      setErroCadastro('Endereço deve ser preenchido!');
      return;
    }
    
    if (!cep) {
      setErroCadastro('CEP deve ser informado!');
      return;
    }
    
    // if (!senha) {
    //   setErroCadastro('Senha deve ser informada!');
    //   return;
    // }
    
    setErroCadastro('');
    
  }, [nome, email, nascimento, cpf, endereco, cep])
  
  function validaCpf(strCPF: string) {
    
    strCPF = strCPF.replace(/[^\d]/g, "");;
    
    let soma = 0;
    let resto = 0;
    
    if (strCPF === "00000000000") return false;
     
    for (let i=  1; i<=9; i++) soma = soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
   
    if ((resto === 10) || (resto === 11))  resto = 0;
    if (resto !== parseInt(strCPF.substring(9, 10)) ) return false;
   
    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
   
    if ((resto === 10) || (resto === 11))  resto = 0;
    if (resto !== parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
  }
  
  function validaEmail(email: string) {
    
    let usuario = email.substring(0, email.indexOf("@"));
    let dominio = email.substring(email.indexOf("@")+ 1, email.length);
     
    if ((usuario.length >=1) &&
        (dominio.length >=3) && 
        (usuario.search("@")===-1) && 
        (dominio.search("@")===-1) &&
        (usuario.search(" ")===-1) && 
        (dominio.search(" ")===-1) &&
        (dominio.search(".")!==-1) &&      
        (dominio.indexOf(".") >=1)&& 
        (dominio.lastIndexOf(".") < dominio.length - 1)) {
      return true;
    } else {
      return false;
    }
  }
  
  function carregaFisioterapeuta() {
    
    setCarregando(true);
    
    buscaFisioterapeutaPorId(id).then((fisio: any) => {
      
      setCep(fisio.cep);
      setCpf(formatCpf(fisio.cpf));
      setEmail(fisio.email);
      setEndereco(fisio.endereco);
      setNome(fisio.nome);
      setSexo(fisio.sexo);
      setNascimento(timestampToDate(fisio.dataNascimento).toString());
      
      getUserFromAuthBase(fisio.cpf).then((resp: any) => {
        
        if (resp) {
          setAtivo(resp.ativo);
        }
        
        setCarregando(false);
        
      });
      
    });
    
  }
  
  const cadastrar = () => {
    
    setGravando(true);
    
    buscaFisioterapeutaPorEmail(email).then((data: any) => {
      
      let jaCad = true;
      
      if (data.val() === null) {
        jaCad = false;
      } else {
        
        const keys = Object.keys(data.val());
        
        if (keys[0] === id) {
          jaCad = false;
        }
        
      }
      
      if (!jaCad) {
        
        const fisioterapeuta = {
          nome: nome,
          email: email,
          sexo: sexo,
          cpf: cpf.replace(/[^\d]/g, ""),
          endereco: endereco,
          cep: cep,
          ativo: ativo,
          dataNascimento: new Date(nascimento)
        };
        
        let key = '';
        if (!novoCadastro) {
          key = id;
        } else {
          key = getKeyNovoFisioterapeuta();
        }
        
        cadastrarFisioterapeuta(key, fisioterapeuta).then(() => {
          
          if (id) {
            deleteUserFromAuthBase(fisioterapeuta.cpf);
          }
          
          addUserToAuthBase(fisioterapeuta.cpf, email, '', key, nome, 'F', true).then(() => {
            
            setCarregando(false);
            setGravando(false);
            props.history.push('/fisioterapeutas/lista');
            
          })
          
        });
        
      } else {
        setErro('Este e-mail já está cadastrado para outro fisioterapeuta!');
      }
      
    })
    
  };
  
  const changeCpf = (e: any) => {
    
    setCpf(formatCpf(e.detail.value!.trim()));
    
  }
  
  function formatCpf(cpf: string) {
    
    cpf = cpf.replace(/[^\d]/g, "");
    
    if (cpf.length >= 3) {
      cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    }
    if (cpf.length >= 6) {
      cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    }
    if (cpf.length >= 9) {
      cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    
    return cpf;
    
  }
  
  const checkAtivo = (e: any) => {
    setAtivo(e.target.checked);
  }
  
  return (
   
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
            <IonTitle>{ routeName }</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        
        <IonToast isOpen={!!erro} onDidDismiss={e => setErro('')} message={erro} duration={4000} />
        
        {carregando && <IonRow>
          <IonCol className="ion-text-center">
            <IonSpinner></IonSpinner>
          </IonCol>  
        </IonRow>}
        
        {!carregando && <IonList>
          
          <IonListHeader color="secundary">
            Dados Pessoais
          </IonListHeader>
          
          <IonItem>
            <IonLabel position="floating">Nome</IonLabel>
            <IonInput value={nome} onIonChange={e => setNome(e.detail.value!)} disabled={gravando}></IonInput>
          </IonItem>
          
          <IonItem>
            <IonLabel position="floating">E-mail</IonLabel>
            <IonInput type="email" value={email} onIonChange={e => setEmail(e.detail.value!)} disabled={gravando}></IonInput>
          </IonItem>
          
          <IonItem>
            <IonLabel position="floating">Data de Nascimento</IonLabel>
            <IonDatetime value={nascimento} onIonChange={e => setNascimento(e.detail!.value!)} disabled={gravando}/>
          </IonItem>
          
          <IonItem>
            <IonLabel position="floating">Sexo</IonLabel>
            <IonSelect value={sexo} onIonChange={e => setSexo(e.detail.value)} disabled={gravando}>
              <IonSelectOption value="f">Feminino</IonSelectOption>
              <IonSelectOption value="m">Masculino</IonSelectOption>
            </IonSelect>
          </IonItem>
          
          <IonItem>
            <IonLabel position="floating">CPF</IonLabel>
            <IonInput value={cpf} onIonChange={changeCpf} disabled={gravando} maxlength={14}></IonInput>
          </IonItem>
          
          <IonItem>
            <IonLabel position="floating">Endereço</IonLabel>
            <IonInput value={endereco} onIonChange={e => setEndereco(e.detail.value!)} disabled={gravando}></IonInput>
          </IonItem>
          
          <IonItem>
            <IonLabel position="floating">CEP</IonLabel>
            <IonInput value={cep} onIonChange={e => setCep(e.detail.value!)} disabled={gravando}></IonInput>
          </IonItem>
          
        </IonList>}
        
        {!carregando && !novoCadastro && <IonList className="ion-margin-top">
          
          <IonListHeader>
            Configuração
          </IonListHeader>
          
          {!novoCadastro && <IonItem>
            <IonLabel>Ativo</IonLabel>
            <IonToggle checked={ativo} onIonChange={checkAtivo} disabled={gravando}/>
          </IonItem>}
          
        </IonList>}
        
        {!carregando && <IonRow>
          <IonCol className="ion-text-right">
            <IonButton color="success" onClick={cadastrar} disabled={!!erroCadastro}>
              <IonIcon icon={checkmarkSharp} slot="start"></IonIcon>
              Salvar
            </IonButton>
          </IonCol>
        </IonRow>}
        
        {gravando && <IonRow>
          <IonCol className="ion-text-center">
            <IonSpinner></IonSpinner>
          </IonCol>  
        </IonRow>}
        
      </IonContent>
    </IonPage>
    
  );
};

export default CadastroFisioterapeuta;
