describe("Autenticação", () => {
  it("Sem um token, um usuário não deve acessar /home", () => {
    cy.clearLocalStorage();

    cy.visit("/home");

    cy.location("pathname").should("eq", "/");
  });

  it("Fazer login e depois acessar /home", () => {
    cy.fixture("user").then((user) => {
      cy.visit("/");

      cy.get('[data-cy="login-username"]').type(user.username);
      cy.get('[data-cy="login-password"]').type(user.password);

      cy.get('[data-cy="login-button"]').click();

      cy.location("pathname").should("eq", "/home");

      cy.window().then((win) => {
        expect(win.localStorage.getItem("token")).to.exist;
      });
    });
  });

  it("Fazer login com credenciais inválidas deve resultar em um erro", () => {
    cy.fixture("user").then((user) => {
      cy.visit("/");

      cy.get('[data-cy="login-username"]').type("UsuarioInexistente");
      cy.get('[data-cy="login-password"]').type("SenhaErrada");

      cy.get('[data-cy="login-button"]').click();

      cy.location("pathname").should("eq", "/");

      cy.contains("Usuário ou senha inválidos.").should("be.visible");

      cy.window().then((win) => {
        expect(win.localStorage.getItem("token")).to.not.exist;
      });
    });
  });
});
