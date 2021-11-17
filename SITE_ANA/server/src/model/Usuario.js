const Model = require("./Model");

module.exports = class Usuario extends Model {
    constructor() {
        super("usuario");
    }

    async login(email, senha) {
        const usuario = await this.list(`WHERE email = '${email}' AND senha = '${senha}'`, null, 1)[0];
        if(!usuario) {
            throw new Error("Email ou senha incorretos");
        }
        return usuario;
    }
    async save(object) {
        const usuarioComMesmoEmail = (await this.list(`WHERE email = '${object.email}'`, null, 1))[0];
        if(usuarioComMesmoEmail) {
            if(!(object.id && object.id==usuarioComMesmoEmail.id)) {
                throw new Error(`Já existe um usuário com este email.`);
            }
        }
        const usuarioComMesmaSenha = (await this.list(`WHERE senha = '${object.senha}'`, null, 1))[0];
        if(usuarioComMesmaSenha) {
            if(!(object.id && object.id==usuarioComMesmaSenha.id)) {
                throw new Error(`O usuário ${usuarioComMesmaSenha.email} já utiliza a senha ${usuarioComMesmaSenha.senha}. Escolha outra.`);
            }
        }
        super.save(object);
    }

    static getInstance() {
        if(!Usuario.instance) {
            Usuario.instance = new Usuario();
        }
        return Usuario.instance;
    }
}