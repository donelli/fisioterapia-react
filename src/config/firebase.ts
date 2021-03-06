import * as firebase from 'firebase';
import { Usuario } from './classes';

const config = // FIREBASE CONFIG HERE

firebase.initializeApp(config);
firebase.analytics();

const storage = firebase.storage();

// ------------------------------ Funções ------------------------------ //

export function timestampToDate(data: any) {
  const time = new firebase.firestore.Timestamp(data.seconds, data.nanoseconds);
  return time.toDate();
}

export function dateToTimestamp(date: Date) {
  return firebase.firestore.Timestamp.fromDate(date);
}

// ------------------------------ Keys ------------------------------ //

export function getKeyFromKeysBase(tipo: 'fisioterapeuta' | 'paciente' | 'avaliacao', subChave: string | null = null): Promise<number> {
  return new Promise((resolve, reject) => {
    
    let path = 'keys/' + tipo;
    if (subChave) {
      path += '/' + subChave;
    }
    
    const ref = firebase.database().ref(path);
    
    ref.once('value', (snapshot) => {
      
      const result = snapshot.val();
      
      const novoVal = parseInt(result ? (result + 1) : 1);
      
      ref.set(novoVal);
      resolve(novoVal);
      
    });
    
  });
}

// ------------------------------ AuthBase ------------------------------ //

export function addUserToAuthBase(cpf: string, email: string, senha: string, id: string, nome: string, tipo: 'F' | 'P', ativo: boolean) {
  return new Promise((resolve, reject) => {
    
    const usuario = new Usuario(id, email, senha, nome, tipo, ativo);
    
    try {
      firebase.database().ref('users/' + cpf).set(usuario).then((data) => {
        resolve(true);
      }, (error) => {
        resolve(false);
      })
    } catch (error) {
      console.log(error);
      resolve(false);
    }
    
  });
}

export function deleteUserFromAuthBase(cpf: string) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('users/' + cpf);
    
    ref.remove().then(function() {
      resolve(true);
    })
    .catch(function(error) {
      reject(error.message)
    });
    
  });
}

export function getUserFromAuthBase(cpf: string){
  return new Promise<Usuario | null>((resolve, reject) => {
    
    const ref = firebase.database().ref('users/' + cpf);
    
    ref.once('value', snapshot => {
      const usu = snapshot.val();
      if (usu === null) {
        resolve(null);
        return;
      }
      resolve(new Usuario(usu.id, usu.email, usu.senha, usu.nome, usu.tipo, usu.ativo));
    });
    
  });
}

export function alterUserFromAuthBase(cpf: string, dados: any) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('users/' + cpf);
    
    ref.once('value', snapshot => {
      ref.update({ ...dados }).then(resp => {
        resolve(true);
      }, error => {
        resolve(false);
      });
    })
    
  });
}

// ------------------------------ Fisioterapeuta ------------------------------ //

export function getKeyNovoFisioterapeuta(): Promise<string> {
  
  return new Promise((resolve, reject) => {
    getKeyFromKeysBase('fisioterapeuta').then(key => {
      resolve(key.toString());
    })
  });
  
}

export async function cadastrarFisioterapeuta(key: string, data: any) {
  return new Promise((resolve, reject) => {
    
    if (data.dataNascimento instanceof Date) {
      data.dataNascimento = firebase.firestore.Timestamp.fromDate(data.dataNascimento);
    }
    
    try {
      firebase.database().ref('fisioterapeutas/' + key).set(data).then(() => {
        resolve(true);
      }, () => {
        resolve(false);
      })
      
    } catch (error) {
      console.log(error);
      resolve(false);
    }
    
  });
}

export function buscaFisioterapeutaPorId(id: string) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('fisioterapeutas/' + id);
    
    ref.once('value', (snapshot) => {
      resolve(snapshot.val());
    })
    
  });
  
}

export function deleteFisioterapeutaPorId(id: string) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('fisioterapeutas/' + id);
    
    ref.remove().then(function() {
      resolve(true);
    })
    .catch(function(error) {
      reject(error.message)
    });
    
  });
}

export function getUltimosFisioterapeutasCadastrados(limit: number | null) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('fisioterapeutas/');
    
    let consulta;
    
    if (limit) {
      consulta = ref.limitToLast(limit);
    } else {
      consulta = ref;
    }
    
    consulta.once('value', (snapshot) => {
      
      const fisios = snapshot.val();
      const retorno = [];
      
      const keys = Object.keys(fisios);
      
      for (const key of keys) {
        retorno.push({ codigo: key, ...fisios[key] });
      }
      
      resolve(retorno);
      
    }, () => {
      resolve(null);
    });
    
  });
}

// ------------------------------ Pacientes ------------------------------ //

export function cadastrarPaciente(key: string, data: any) {
  return new Promise((resolve, reject) => {
    
    if (data.dataNascimento instanceof Date) {
      data.dataNascimento = firebase.firestore.Timestamp.fromDate(data.dataNascimento);
    }
    
    try {
      firebase.database().ref('pacientes/' + key).set(data).then(() => {
        resolve(true);
      }, () => {
        resolve(false);
      })
      
    } catch (error) {
      console.log(error);
      resolve(false);
    }
    
  });
}

export function getUltimosPacientesCadastrados(limit: number | null) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('pacientes/');
    
    let consulta;
    
    if (limit) {
      consulta = ref.limitToLast(limit);
    } else {
      consulta = ref;
    }
    
    consulta.once('value', (snapshot) => {
      
      const paciente = snapshot.val();
      const retorno = [];
      
      if (!paciente) {
        resolve([]);
        return;
      }
      
      const keys = Object.keys(paciente);
      
      for (const key of keys) {
        retorno.push({ codigo: key, ...paciente[key] });
      }
      
      resolve(retorno);
      
    }, () => {
      resolve(null);
    });
    
  });
}

export function getKeyNovoPaciente(): Promise<string> {
  
  return new Promise((resolve, reject) => {
    getKeyFromKeysBase('paciente').then(key => {
      resolve(key.toString());
    })
  });
  
}

export function buscaPacientePorId(id: string) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('pacientes/' + id);
    
    ref.once('value', (snapshot) => {
      resolve(snapshot.val());
    })
    
  });
}

export function deletePacientePorId(id: string) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('pacientes/' + id);
        
    ref.remove().then(function() {
      resolve(true);
    })
    .catch(function(error) {
      reject(error.message)
    });
    
  });
}

export function buscaPacientesDoFisioterapeuta(idFisio: string) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('pacientes').orderByChild('responsavel').equalTo(idFisio);
    
    ref.once('value', (snapshot) => {
      resolve(snapshot.val());
    })
    
  });
}

// ------------------------------ Avaliações ------------------------------ //

export function buscaAvaliacoesDoPaciente(idPaciente: string) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('avaliacao/' + idPaciente);
    
    ref.once('value', (snapshot) => {
      
      const fisios = snapshot.val();
      const retorno = [];
      
      if (!fisios) {
        resolve([]);
        return;
      }
      
      const keys = Object.keys(fisios);
      
      for (const key of keys) {
        retorno.push({ codigo: key, ...fisios[key] });
      }
      
      resolve(retorno);
      
    });
    
  });
}

export function getKeyNovaAvaliacao(idPaciente: string): Promise<string> {
  
  return new Promise((resolve, reject) => {
    getKeyFromKeysBase('avaliacao', idPaciente).then(key => {
      resolve(key.toString());
    })
  });
  
}

export function cadastrarAvaliacao(key: string, idPaciente: string, dados: any) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('avaliacao/' + idPaciente + '/' + key);
    
    ref.set(dados).then(resp => {
      resolve(true);
    })
    
  });
}

export function buscaAvaliacaoPorId(idPaciente: string, idAvaliacao: string) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('avaliacao/' + idPaciente + '/' + idAvaliacao);
    
    ref.once('value', (snapshot) => {
      resolve(snapshot.val());
    })
    
  });
}

export function deleteAvaliacaoPorId(idPaciente: string, idAvaliacao: string) {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('avaliacao/' + idPaciente + '/' + idAvaliacao);
    
    ref.remove().then(function() {
      resolve(true);
    })
    .catch(function(error) {
      reject(error.message)
    });
    
  });
}

// ------------------------------ Grupos de Pacientes ------------------------------ //

export function buscaGruposPacientes() {
  return new Promise((resolve, reject) => {
    
    const ref = firebase.database().ref('grupos_pacientes');
    
    ref.once('value', snapshot => {
      
      const grupos = snapshot.val();
      const retorno: Array<{ codigo: string, descricao: string }> = [];
      
      const keys = Object.keys(grupos);
      
      for (const key of keys) {
        retorno.push({ codigo: key, descricao: grupos[key].descricao });
      }
      
      resolve(retorno);
      
    });
    
  })
}

// ------------------------------ Firebase Storage ------------------------------ //

export function salvaImagemAvaliacao(idPaciente: string, idAvaliacao: string, fileName: string, base64: string) {
  
  let base = base64.replace('data:image/png;base64,', '');
  
  return saveBase64InFirebaseStorage('/avaliacoes/' + idPaciente + '/' + idAvaliacao, fileName, base);
  
}

export function getUrlFotoAvaliacao(idPaciente: string, idAvaliacao: string, nome: string) {
  return getUrlToFirebaseStorage('/avaliacoes/' + idPaciente + '/' + idAvaliacao + '/' + nome);
}

export function deleteImagensAvaliacao(idPaciente: string, idAvaliacao: string, nome: string) {
  return deleteFromFirebaseStorage('/avaliacoes/' + idPaciente + '/' + idAvaliacao + '/' + nome);
}

function deleteFromFirebaseStorage(path: string) {
  return new Promise((resolve, reject) => {
    
    storage.ref(path).delete().then(resp => {
      resolve(true);
    }, error => {
      resolve(false);
    })
    
  });
}

function saveBase64InFirebaseStorage(path: string, fileName: string, base64: string) {
  return storage.ref(path).child(fileName).putString(base64, 'base64', {contentType:'image/jpg'});
}

function getUrlToFirebaseStorage(path: string) {
  return new Promise((resolve, reject) => {
    storage.ref(path).getDownloadURL().then(resp => {
      resolve(resp);
    })
  });
}
