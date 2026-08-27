// All site copy in English, Portuguese (BR), and Spanish.
// Edit text here; the components read from it by key.

export const translations = {
  en: {
    nav: { research: "Research", engineering: "Engineering", photography: "Photography", about: "About", contact: "Contact" },
    tag: { a: "Neuroscience", b: "Computer Science", c: "Creativity" },
    scroll: "scroll ↓",
    research: {
      eyebrow: "Research · Neuroscience",
      h2: "Seeing cells under stress",
      lede: "Two projects at the intersection of neuroscience and code, imaging how proteins and cells misbehave in disease, and building the pipelines that turn microscopy into measurements. (My thesis is public; a summer project is described at the level cleared for the Parkinson's Foundation site.)",
      p1: {
        h3: "α-Synuclein, lipids, and the lysosome",
        body: "As a Parkinson's Foundation research fellow, I asked whether the lipids bound to α-synuclein fibrils change how cells try to clear them. In H4 neuroglioma cells I compared plain preformed fibrils (PFFs) with glycosphingolipid-associated fibrils (GSL-PFFs), imaging α-synuclein against the lysosomal marker LAMP1 by confocal microscopy and quantifying signal in Imaris. Early imaging suggested the lipid-associated aggregates drew a weaker lysosomal response, a hint that the lipids may blunt the cell's ability to digest them, which matters because lysosomal failure is central to Parkinson's.",
        fig1: "H4 neuroglioma treated with α-synuclein fibrils. F-actin (488), α-synuclein/MJFR1 (568), LAMP1 (647), nuclei (405). Leica confocal, 40×, scale bar 20 µm.",
        fig2: "Isolated cells, same panel. Channels as in Fig. 1. Scale bar 20 µm.",
      },
      p2: {
        h3: "Glia, mitochondria, and traumatic brain injury",
        body: "My undergraduate honors thesis (Crocker Lab, Middlebury) traced how glial cells clear damage and how mitochondria cope in the hours after traumatic brain injury, in Drosophila. I examined Draper and JAK–STAT glial signaling alongside mitochondrial quality control, combining Western blotting with confocal imaging, and wrote a Python pipeline that turned 19,000+ images into reproducible measurements. Archived in Middlebury's thesis repository.",
      },
    },
    eng: {
      eyebrow: "Engineering · Computer Science",
      h2: "Building things that run",
      lede: "The computer-science half. I build web interfaces and the tooling behind them, and I gravitate to problems where the data is messy, large, or biological.",
      e1: { h3: "Web & interface engineering", body: "Day to day I work in React, TypeScript, and Next.js, building internal tools used by real teams, I care about the seam between a clean interface and the data model under it." },
      e2: { h3: "Scientific computing", body: "Python pipelines for large-scale image analysis, the 19,000-image thesis pipeline is the clearest example, plus a foundation in algorithms and theory of computation." },
      e3: { h3: "This page is the demo", body: "The network behind the header is a spiking neural-network simulation I wrote from scratch: integrate-and-fire neurons that fire across their synapses and drop into a refractory period, the same dynamics I studied in the wet lab, live on canvas." },
      source: "Source on GitHub →",
    },
    about: {
      eyebrow: "About",
      h2: "Between the wet lab and the terminal",
      lede: "I'm a software developer with a neuroscience research background, with a double major in Computer Science and Neuroscience, an honors thesis in glial signaling, and a habit of reaching for code whenever the data gets bigger than a spreadsheet. Research, engineering, and a camera: the three strands in the tagline are the three things I actually do.",
    },
    contact: { eyebrow: "Contact", h2: "Let's talk", resume: "Resume (PDF)", email: "Email" },
    photo: {
      eyebrow: "Photography · Creativity",
      title: "Through the lens",
      intro: "Mostly nature and animals. Horses, farms, and the quiet parts of the countryside.",
      back: "← Back",
      watermark: "© Gabriela Clemente · All rights reserved",
    },
  },

  pt: {
    nav: { research: "Pesquisa", engineering: "Engenharia", photography: "Fotografia", about: "Sobre", contact: "Contato" },
    tag: { a: "Neurociência", b: "Ciência da Computação", c: "Criatividade" },
    scroll: "role ↓",
    research: {
      eyebrow: "Pesquisa · Neurociência",
      h2: "Células sob estresse",
      lede: "Dois projetos no encontro entre a neurociência e o código, investigar como proteínas e células se comportam mal na doença e construir os pipelines que transformam microscopia em medidas. (Minha tese é pública; um projeto de verão é descrito no nível liberado para o site da Parkinson's Foundation.)",
      p1: {
        h3: "α-Sinucleína, lipídios e o lisossomo",
        body: "Como bolsista de pesquisa da Parkinson's Foundation, investiguei se os lipídios ligados às fibrilas de α-sinucleína alteram a forma como as células tentam eliminá-las. Em células H4, comparei fibrilas pré-formadas (PFFs) com fibrilas associadas a glicoesfingolipídios (GSL-PFFs), visualizando a α-sinucleína junto ao marcador lisossomal LAMP1 por microscopia confocal e quantificando o sinal no Imaris. As primeiras imagens sugeriram que os agregados associados a lipídios provocavam uma resposta lisossomal mais fraca, um indício de que os lipídios podem dificultar sua digestão, o que importa porque a falha lisossomal é central no Parkinson.",
        fig1: "H4 tratadas com fibrilas de α-sinucleína. F-actina (488), α-sinucleína/MJFR1 (568), LAMP1 (647), núcleos (405). Confocal Leica, 40×, barra de escala 20 µm.",
        fig2: "Células isoladas, mesmo painel. Canais como na Fig. 1. Barra de escala 20 µm.",
      },
      p2: {
        h3: "Glia, mitocôndrias e lesão cerebral",
        body: "Minha tese de honras (Crocker Lab, Middlebury) acompanhou como as células gliais lidam com danos e como as mitocôndrias respondem nas horas seguintes a uma lesão cerebral traumática, em Drosophila. Estudei a sinalização glial via Draper e JAK–STAT junto ao controle de qualidade mitocondrial, combinando Western blot e imagem confocal, e escrevi um pipeline em Python que transformou mais de 19.000 imagens em medidas reprodutíveis. Arquivada no repositório de teses de Middlebury.",
      },
    },
    eng: {
      eyebrow: "Engenharia · Ciência da Computação",
      h2: "Construir coisas que funcionam",
      lede: "A metade da ciência da computação. Construo interfaces web e as ferramentas por trás delas, e gosto de problemas em que os dados são confusos, grandes ou biológicos.",
      e1: { h3: "Engenharia web e de interfaces", body: "No dia a dia trabalho com React, TypeScript e Next.js, construindo ferramentas internas usadas por equipes reais, me importo com a costura entre uma interface limpa e o modelo de dados por baixo dela." },
      e2: { h3: "Computação científica", body: "Pipelines em Python para análise de imagens em larga escala, o pipeline de 19.000 imagens da tese é o exemplo mais claro, além de uma base em algoritmos e teoria da computação." },
      e3: { h3: "Esta página é a demonstração", body: "A rede atrás do cabeçalho é uma simulação de rede neural de disparo que escrevi do zero: neurônios integra-e-dispara que disparam pelas sinapses e entram em período refratário, a mesma dinâmica que estudei no laboratório, ao vivo no canvas." },
      source: "Código no GitHub →",
    },
    about: {
      eyebrow: "Sobre",
      h2: "Entre o laboratório e o terminal",
      lede: "Sou desenvolvedora de software com formação em pesquisa em neurociência, com dupla graduação em Ciência da Computação e Neurociência, uma tese de honras em sinalização glial e o hábito de recorrer ao código sempre que os dados ficam maiores que uma planilha. Pesquisa, engenharia e uma câmera: os três fios do subtítulo são as três coisas que eu de fato faço.",
    },
    contact: { eyebrow: "Contato", h2: "Vamos conversar", resume: "Currículo (PDF)", email: "E-mail" },
    photo: {
      eyebrow: "Fotografia · Criatividade",
      title: "Através das lentes",
      intro: "Sobretudo natureza e animais. Cavalos, fazendas e os cantos tranquilos do campo.",
      back: "← Voltar",
      watermark: "© Gabriela Clemente · Todos os direitos reservados",
    },
  },

  es: {
    nav: { research: "Investigación", engineering: "Ingeniería", photography: "Fotografía", about: "Sobre mí", contact: "Contacto" },
    tag: { a: "Neurociencia", b: "Ciencia de la Computación", c: "Creatividad" },
    scroll: "desliza ↓",
    research: {
      eyebrow: "Investigación · Neurociencia",
      h2: "Células bajo estrés",
      lede: "Dos proyectos en el cruce entre la neurociencia y el código, observar cómo proteínas y células se comportan mal en la enfermedad y construir los pipelines que convierten la microscopía en mediciones. (Mi tesis es pública; un proyecto de verano se describe al nivel autorizado para el sitio de la Parkinson's Foundation.)",
      p1: {
        h3: "α-Sinucleína, lípidos y el lisosoma",
        body: "Como becaria de investigación de la Parkinson's Foundation, investigué si los lípidos unidos a las fibrillas de α-sinucleína cambian la forma en que las células intentan eliminarlas. En células H4 comparé fibrillas preformadas (PFFs) con fibrillas asociadas a glicoesfingolípidos (GSL-PFFs), visualizando la α-sinucleína junto al marcador lisosomal LAMP1 por microscopía confocal y cuantificando la señal en Imaris. Las primeras imágenes sugirieron que los agregados asociados a lípidos provocaban una respuesta lisosomal más débil, un indicio de que los lípidos podrían dificultar su digestión, algo relevante porque el fallo lisosomal es central en el Parkinson.",
        fig1: "H4 tratadas con fibrillas de α-sinucleína. F-actina (488), α-sinucleína/MJFR1 (568), LAMP1 (647), núcleos (405). Confocal Leica, 40×, barra de escala 20 µm.",
        fig2: "Células aisladas, mismo panel. Canales como en la Fig. 1. Barra de escala 20 µm.",
      },
      p2: {
        h3: "Glía, mitocondrias y lesión cerebral",
        body: "Mi tesis de honores (Crocker Lab, Middlebury) siguió cómo las células gliales manejan el daño y cómo responden las mitocondrias en las horas posteriores a una lesión cerebral traumática, en Drosophila. Estudié la señalización glial vía Draper y JAK–STAT junto al control de calidad mitocondrial, combinando Western blot e imagen confocal, y escribí un pipeline en Python que convirtió más de 19.000 imágenes en mediciones reproducibles. Archivada en el repositorio de tesis de Middlebury.",
      },
    },
    eng: {
      eyebrow: "Ingeniería · Ciencia de la Computación",
      h2: "Construir cosas que funcionan",
      lede: "La mitad de la ciencia de la computación. Construyo interfaces web y las herramientas detrás de ellas, y me atraen los problemas donde los datos son desordenados, grandes o biológicos.",
      e1: { h3: "Ingeniería web y de interfaces", body: "En el día a día trabajo con React, TypeScript y Next.js, construyendo herramientas internas usadas por equipos reales, me importa la costura entre una interfaz limpia y el modelo de datos que hay debajo." },
      e2: { h3: "Computación científica", body: "Pipelines en Python para análisis de imágenes a gran escala, el pipeline de 19.000 imágenes de la tesis es el ejemplo más claro, además de una base en algoritmos y teoría de la computación." },
      e3: { h3: "Esta página es la demostración", body: "La red detrás del encabezado es una simulación de red neuronal de disparo que escribí desde cero: neuronas integra-y-dispara que disparan por sus sinapsis y entran en período refractario, la misma dinámica que estudié en el laboratorio, en vivo sobre canvas." },
      source: "Código en GitHub →",
    },
    about: {
      eyebrow: "Sobre mí",
      h2: "Entre el laboratorio y la terminal",
      lede: "Soy desarrolladora de software con formación en investigación en neurociencia, con doble titulación en Ciencia de la Computación y Neurociencia, una tesis de honores en señalización glial y la costumbre de recurrir al código cuando los datos superan una hoja de cálculo. Investigación, ingeniería y una cámara: los tres hilos del subtítulo son las tres cosas que de verdad hago.",
    },
    contact: { eyebrow: "Contacto", h2: "Hablemos", resume: "CV (PDF)", email: "Correo" },
    photo: {
      eyebrow: "Fotografía · Creatividad",
      title: "A través del objetivo",
      intro: "Sobre todo naturaleza y animales. Caballos, granjas y los rincones tranquilos del campo.",
      back: "← Volver",
      watermark: "© Gabriela Clemente · Todos los derechos reservados",
    },
  },
};
