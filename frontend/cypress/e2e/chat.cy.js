describe("Chat", () => {
  it("Fazer login, acessar o chat e enviar uma mensagem", () => {
    const mensagem = `Estou me sentindo ótimo ${Date.now()}`;

    cy.fixture("user").then((user) => {
      cy.visit("/");

      cy.get('[data-cy="login-username"]').type(user.username);
      cy.get('[data-cy="login-password"]').type(user.password);

      cy.get('[data-cy="login-button"]').click();

      cy.location("pathname").should("eq", "/home");

      cy.visit("/chat");

      cy.location("pathname").should("eq", "/chat");

      cy.get('[data-cy="chat-input"]').type(mensagem);

      cy.get('[data-cy="chat-send-button"]').click();

      cy.get('[data-cy="chat-messages"]')
        .should("be.visible")
        .and("contain", mensagem);
    });
  });
});