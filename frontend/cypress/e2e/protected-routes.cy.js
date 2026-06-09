describe("Acesso a rotas protegidas", () => {
  it("Fazer login e acessar as principais rotas protegidas", () => {
    cy.fixture("user").then((user) => {
      cy.visit("/");

      cy.get('[data-cy="login-username"]').type(user.username);
      cy.get('[data-cy="login-password"]').type(user.password);

      cy.get('[data-cy="login-button"]').click();

      cy.location("pathname").should("eq", "/home");

      cy.visit("/questionario");
      cy.location("pathname").should("eq", "/questionario");

      cy.visit("/insights");
      cy.location("pathname").should("eq", "/insights");

      cy.visit("/chat");
      cy.location("pathname").should("eq", "/chat");
    });
  });

  it("Redirecionar um usuário comum ao tentar acessar a Dashboard", () => {
    cy.fixture("user").then((user) => {
      cy.visit("/");

      cy.get('[data-cy="login-username"]').type(user.username);
      cy.get('[data-cy="login-password"]').type(user.password);

      cy.get('[data-cy="login-button"]').click();

      cy.location("pathname").should("eq", "/home");

      cy.visit("/dashboard");

      cy.location("pathname").should("eq", "/home");
    });
  });
});
