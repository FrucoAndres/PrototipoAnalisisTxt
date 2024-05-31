from fastapi import FastAPI, Form
from transformers import pipeline
import nltk
import requests
from nltk.tokenize import sent_tokenize
from fastapi.middleware.cors import CORSMiddleware
from googletrans import Translator

# Se instancia el traductor
traductor = Translator()

# Instalacion del tokenizador de oraciones en lenguaje natural
nltk.download('punkt')

# Se instancia la api
app = FastAPI()

# Configurar CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir solicitudes desde cualquier origen
    allow_credentials=True,
    allow_methods=["POST, GET"],  # Permitir solo el método POST y GET
    allow_headers=["*"],  # Permitir cualquier encabezado en las solicitudes
    expose_headers=["Content-Disposition"]  # Exponer el encabezado Content-Disposition
)

# Instanciar el modelo de analisis de sentimiento
clasificador = pipeline('sentiment-analysis', model='VerificadoProfesional/SaBERT-Spanish-Sentiment-Analysis')

# Funcion para traducir textos de latín a español
def traducir_texto_latin(texto):
    traduccion = traductor.translate(texto, src='la', dest='es')
    return traduccion.text

# Fragmentación de texto con ntkl a un numero específico de tokens
def fragmentar_texto(texto, max_tokens=50, max_longitud=512):
    oraciones = sent_tokenize(texto)
    fragmentos = []
    fragmento_actual = []

    for oracion in oraciones:
        fragmento_actual.append(oracion)
        tokens_en_fragmento = len(clasificador.tokenizer.encode(" ".join(fragmento_actual)))
        if tokens_en_fragmento >= max_tokens or tokens_en_fragmento >= max_longitud:
            if tokens_en_fragmento > max_longitud:
                # Truncar el fragmento si excede el límite de longitud
                fragmento_actual = fragmento_actual[:max_tokens]  # o ajusta según necesites
            fragmentos.append(" ".join(fragmento_actual))
            fragmento_actual = []

    if fragmento_actual:
        fragmentos.append(" ".join(fragmento_actual))

    return fragmentos

# Se hace el analisis de texto para cada uno de los textos fragmentados (Si lo hay)
def analizar_sentimiento(texto):
    fragmentos = fragmentar_texto(texto)
    valores = []
    puntos_acumulados = 0

    for fragmento in fragmentos:
        resultado = clasificador(fragmento)
        clasificacion = resultado[0]['label']
        puntos = resultado[0]['score']

        if clasificacion == 'Negative':
            if puntos > 0.98:
                puntos_acumulados -= puntos
                valores.append(-puntos)
        else:
            if puntos > 0.98:
                puntos_acumulados += puntos
                valores.append(puntos)

    clasificacion_final = determinar_clasificacion_final(puntos_acumulados)

    return {
        "fragmentos": fragmentos,
        "valores": valores,
        "clasificacion_final": clasificacion_final,
        "puntos": puntos_acumulados
    }

# Se determina la clasificacion del conjunto o conjuntos de texto
def determinar_clasificacion_final(puntos_acumulados):
    if puntos_acumulados < -0.98:
        return 'negativo'
    elif puntos_acumulados < 0:
        return 'poco negativo'
    elif puntos_acumulados == 0:
        return 'neutro'
    elif puntos_acumulados > 0.98:
        return 'positivo'
    elif puntos_acumulados > 0:
        return 'poco positivo'


@app.get("/comentariosSentimiento")
def obtener_comentarios_sentimiento():
    response = requests.get("https://jsonplaceholder.typicode.com/posts")
    print("fase 1")
    if response.status_code == 200:
        lista_datos = response.json()
        cuerpo_traducido = "" 
        resultados_comentarios = [] 
        puntos = 0

        for datos in lista_datos:
            cuerpo_traducido_actual = traducir_texto_latin(datos["body"])
            cuerpo_traducido += cuerpo_traducido_actual
            
            resultado = analizar_sentimiento(cuerpo_traducido_actual)
            puntos += resultado["puntos"]
            clasificacion = resultado["clasificacion_final"]

            resultados_comentarios.append({"texto": cuerpo_traducido_actual, "calificacion": clasificacion})
        
        puntos_acumulados_total = puntos
        clasificacion_final = determinar_clasificacion_final(puntos_acumulados_total)
        print("fase 2")
        return {
            "clasificacion_final": clasificacion_final,
            "resultados_comentarios": resultados_comentarios
        }
        
    else:
        raise ValueError("No se pudo obtener los datos")





# POST para consumir un microservicio de analisis de texto desde el front
@app.post("/analizarSentimiento")
def analizar_texto_sentimiento(input_text: str = Form(...)):
    fragmentos = fragmentar_texto(input_text)
    print("Texto de entrada recibido:", input_text)
    valores = []
    puntos_acumulados = 0

    for fragmento in fragmentos:
        resultado = clasificador(fragmento)
        clasificacion = resultado[0]['label']
        puntos = resultado[0]['score']

        if clasificacion == 'Negative':
            if puntos > 0.98:
                puntos_acumulados -= puntos
                valores.append(-puntos)
        else:
            if puntos > 0.98:
                puntos_acumulados += puntos
                valores.append(puntos)

    clasificacion_final = determinar_clasificacion_final(puntos_acumulados)

    return {
        "texto_entrada": input_text,
        "fragmentos": fragmentos,
        "valores": valores,
        "clasificacion_final": clasificacion_final,
        "puntos": puntos_acumulados
    }

