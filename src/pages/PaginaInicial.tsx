// Tela inicial (pública): apresenta o PetLocal.
import { Icon } from "../Icons"
import { PublicHeader } from "../components/PublicHeader"

export function PaginaInicial() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <Icon name="heart" size={17} /> Cuidado que aproxima
            </span>
            <h1>
              Seu pet seguro.
              <br />
              <span>Sua família tranquila.</span>
            </h1>
            <p>
              Proteja seu pet com um QR code ou código de identificação. Se ele
              se perder, quem o encontrar vê os dados do animal e o telefone do
              tutor para ligar na hora. Seu e-mail e a sua senha nunca
              aparecem para outras pessoas.
            </p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="sun" aria-hidden="true" />
            <div
              className="map-pin"
              role="img"
              aria-label="Ícone de localização dos pets"
            >
              <Icon name="pin" size={54} />
            </div>
            <div
              className="pet-card dog"
              role="img"
              aria-label="Ilustração de Cacau, um cachorro cadastrado"
            >
              <span className="pet-ears" aria-hidden="true">
                ⌒
              </span>
              <Icon name="dog" size={55} />
              <strong aria-hidden="true">Cacau</strong>
              <small aria-hidden="true">Cachorro</small>
            </div>
            <div
              className="pet-card cat"
              role="img"
              aria-label="Ilustração de Luna, uma gata cadastrada"
            >
              <span className="pet-ears" aria-hidden="true">
                △
              </span>
              <Icon name="cat" size={52} />
              <strong aria-hidden="true">Luna</strong>
              <small aria-hidden="true">Gato</small>
            </div>
            <div className="found-pill">
              <span aria-hidden="true">
                <Icon name="check" size={18} />
              </span>
              <div>
                <strong>Local registrado</strong>
                <small>Há poucos minutos</small>
              </div>
            </div>
          </div>
        </section>
        <section className="feature-strip" aria-label="Benefícios do PetLocal">
          <div className="features">
            <article>
              <span className="feature-icon green">
                <Icon name="paw" />
              </span>
              <h2>Pets organizados</h2>
              <p>
                Cadastre e mantenha as informações dos seus pets atualizadas.
              </p>
            </article>
            <article>
              <span className="feature-icon blue">
                <Icon name="shield" />
              </span>
              <h2>Código ou QR de identificação</h2>
              <p>
                Identifique cada pet para facilitar o contato se ele for
                encontrado.
              </p>
            </article>
            <article>
              <span className="feature-icon yellow">
                <Icon name="mail" />
              </span>
              <h2>Dono avisado rápido</h2>
              <p>
                Quem encontrar o animal vê como falar com o tutor rapidamente.
              </p>
            </article>
          </div>
        </section>
        <section className="how-it-works" aria-labelledby="como-funciona">
          <div className="how-inner">
            <h2 id="como-funciona">Como funciona</h2>
            <div className="how-columns">
              <div>
                <h3>Se você é tutor</h3>
                <ol>
                  <li>Crie sua conta e cadastre seu pet.</li>
                  <li>Imprima o QR code e prenda na coleira.</li>
                  <li>Se ele sumir, clique em “Marcar como desaparecido” em Meus pets.</li>
                </ol>
              </div>
              <div>
                <h3>Se você encontrou um pet</h3>
                <ol>
                  <li>Clique em “Encontrei um pet”. Não precisa ter conta.</li>
                  <li>Digite o código da plaquinha ou leia o QR code com a câmera.</li>
                  <li>Ligue para o tutor ou envie um aviso com o local onde o pet está.</li>
                </ol>
              </div>
            </div>
            <p className="how-note">
              Dica: o PetLocal pode ser usado só com o teclado (tecla Tab para
              avançar, Enter para abrir) e com leitores de tela.
            </p>
          </div>
        </section>
      </main>
      <footer>
        <span>PetLocal · Feito para tutores que cuidam</span>
      </footer>
    </>
  )
}
