// parecerCore.js
window.ParecerCore = {
  data() {
    return {
      dialog: false,
      types: [],
      titleDrawer: '',
      drawer: false,
      typesEspecific: [],
      typesTecnicos: [],
      selectType: null,
      selectTypeTecnicos: null,
      allPareceres: [],
      parecerFilter: [],
      parecer: "",
      currentPage: '',
      parecerSocio: { equipe: '', tecnico: '', orientacao: '' },
      maxCaractere: 0,
      qtdPaginas: 2,
      qtdLinhas: 14,
      paginasFormatadas: [],
      capsLockAtivo: false,
      alertText: false,
      showSocioEquipe: false,
      showSocioTecnico: false,
      showSocioOrientacao: false,
      snackbar: { status: false, text: '' },
      alertas: { equipe: false, tecnico: false, orientacaoSocio: false },
      capsLockCampos: { situacao: false, equipe: false, tecnico: false, orientacaoSocio: false }
    };
  },

  watch: {
    parecer(value) {
      if (value.length > 0) {
        const { linhas } = this.formatarTexto(this.parecer);
        const totalPermitido = this.qtdPaginas * this.qtdLinhas;
        this.alertText = linhas.length > totalPermitido;
      } else {
        this.paginasFormatadas = [];
      }
    }
  },

  computed: {
    botaoDesabilitado() {
      const alertaAtivo = Object.values(this.alertas).some(alerta => alerta === true);
      const camposPreenchidos =
        this.parecerSocio.equipe.trim() ||
        this.parecerSocio.tecnico.trim() ||
        this.parecerSocio.orientacao.trim();
      return alertaAtivo || !camposPreenchidos;
    }
  },

  methods: {
    getTypeEspecific(type) {
      return this.typesEspecific.find(p => p.type === type);
    },
    getAllParecerByEspecific(typeKey) {
      const type = this.getTypeEspecific(typeKey);
      return this.allPareceres.filter(p => p.type === this.selectType && p.type_especific === type?.id);
    },
    getParecer(item) {
      this.parecer = item.text;
    },
    clear() {
      this.parecer = "";
      this.parecerSocio = { equipe: '', tecnico: '', orientacao: '' };
      this.selectTypeTecnicos = null;
      this.showSocioEquipe = false;
      this.showSocioTecnico = false;
      this.showSocioOrientacao = false;
      this.paginasFormatadas = [];
      this.capsLockAtivo = false;
      this.alertText = false;
    },
    copiarTexto(texto) {
      navigator.clipboard.writeText(texto).then(() => {
        this.snackbar.status = true;
        this.snackbar.text = 'Texto copiado com sucesso.';
      }).catch(() => {
        this.snackbar.status = true;
        this.snackbar.text = 'Erro ao copiar o texto.';
      });
    },
    formatarTexto(texto) {
      const maxCaracteres = 76;
      const palavras = texto.split(/\s+/);
      const linhas = [];
      let linhaAtual = '';

      for (const palavra of palavras) {
        if (palavra.length > maxCaracteres) {
          if (linhaAtual) {
            linhas.push(linhaAtual.trim());
            linhaAtual = '';
          }
          linhas.push(palavra);
        } else if ((linhaAtual + ' ' + palavra).trim().length <= maxCaracteres) {
          linhaAtual += ' ' + palavra;
        } else {
          linhas.push(linhaAtual.trim());
          linhaAtual = palavra;
        }
      }

      if (linhaAtual) linhas.push(linhaAtual.trim());
      return { linhas };
    },
    processarCampo(texto) {
      const { linhas } = this.formatarTexto(texto);
      const paginas = [];
      for (let i = 0; i < Math.ceil(linhas.length / this.qtdLinhas); i++) {
        paginas.push(linhas.slice(i * this.qtdLinhas, (i + 1) * this.qtdLinhas).join('\n'));
      }
      return paginas;
    },
    confirmarParecer() {
      this.paginasFormatadas = [
        { titulo: 'Parecer da Equipe Multiprofissional', paginas: this.processarCampo(this.parecerSocio.equipe) },
        { titulo: 'Parecer Técnico', paginas: this.processarCampo(this.parecerSocio.tecnico) },
        { titulo: 'Orientações Finais', paginas: this.processarCampo(this.parecerSocio.orientacao) }
      ];
      this.dialog = true;
    },
    openDrawer(type) {
      this.drawer = true;
      this.showSocioEquipe = type === 'SOCIO_EQUIPE';
      this.showSocioTecnico = type.startsWith("SOCIO_TECNICO");
      this.showSocioOrientacao = type === 'SOCIO_ORIENTACAO';
      this.parecerFilter = this.getAllParecerByEspecific(type);
      const titulos = {
        'SOCIO_EQUIPE': "Modelos de Parecer da Equipe Multiprofissional",
        'SOCIO_TECNICO_PSICOLOGO': "Modelos de Parecer Técnido - Psicólogo(a)",
        'SOCIO_TECNICO_FONOAUDIOLOGO': "Modelos de Parecer Técnido - Fonoaudiólogo(a)",
        'SOCIO_TECNICO_PSICOPEDAGOGO': "Modelos de Parecer Técnido - Psicopedagogo(a)",
        'SOCIO_TECNICO_SERVICO_SOCIAL': "Modelos de Parecer Técnido - Serviço Social",
        'SOCIO_ORIENTACAO': "Modelos de Orientações Finais"
      };
      this.titleDrawer = titulos[type] || "";
    },
    verificarCapsLock(event, campo) {
      this.capsLockCampos[campo] = event.getModifierState && event.getModifierState('CapsLock');
    },
    verificarLimite(texto, campo) {
      const { linhas } = this.formatarTexto(texto);
      this.alertas[campo] = linhas.length > this.qtdPaginas * this.qtdLinhas;
    },
    handleNavigation(link) {
      if (this.currentPage !== link) {
        window.location.href = `${link}.html`;
      }
    },
    scrollParaEquipe(texto) {
      this.parecerSocio.equipe = texto;
      this.$nextTick(() => {
        const anchor = document.getElementById('equipe-anchor');
        if (anchor) {
          const y = anchor.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    },
    scrollParaTecnico(texto) {
      this.parecerSocio.tecnico = texto;
      this.$nextTick(() => {
        const anchor = document.getElementById('tecnico-anchor');
        if (anchor) {
          const y = anchor.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    },
    scrollParaOrientacao(texto) {
      console.log(1);
      this.parecerSocio.orientacao = texto;
      this.$nextTick(() => {
        const anchor = document.getElementById('orientacao-anchor');
        if (anchor) {
          const y = anchor.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    }
  }
};
