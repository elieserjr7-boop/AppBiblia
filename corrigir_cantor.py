import json

def corrigir_cantor_cristao():
    arquivo_entrada = 'cantor_cristao.json'
    arquivo_saida = 'cantor_cristao_corrigido.json'
    
    print(f"--- Lendo {arquivo_entrada} ---")
    
    try:
        with open(arquivo_entrada, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"ERRO: Não encontrei o arquivo '{arquivo_entrada}'.")
        print("Verifica se ele está na mesma pasta que este script.")
        return

    total_corrigidos = 0
    log_mudancas = []

    for numero, hino in data.items():
        coro_atual = hino.get('coro', '').strip()
        verses = hino.get('verses', {})
        
        # Só processamos se o coro estiver vazio
        if not coro_atual and verses:
            novo_coro = ""
            motivo = ""
            chaves_para_remover = []

            # --- ESTRATÉGIA 1: DETECTAR REPETIÇÃO ---
            # Se uma estrofe aparece mais de uma vez, é quase certo que é o coro.
            contagem_textos = {}
            for k, v in verses.items():
                texto_limpo = v.strip()
                if texto_limpo in contagem_textos:
                    contagem_textos[texto_limpo].append(k)
                else:
                    contagem_textos[texto_limpo] = [k]
            
            # Verifica se houve repetição
            for texto, chaves in contagem_textos.items():
                if len(chaves) > 1:
                    novo_coro = texto
                    motivo = f"Repetição detectada nas estrofes {', '.join(chaves)}"
                    # Marcamos TODAS as ocorrências dessa repetição para remover das estrofes
                    chaves_para_remover = chaves
                    break # Encontrou um coro, para de procurar

            # --- ESTRATÉGIA 2: PALAVRAS-CHAVE ---
            # Se não achou por repetição, procura por (bis), coro, refrão
            if not novo_coro:
                for k, v in verses.items():
                    v_lower = v.lower()
                    palavras_chave = ["(bis)", "refrão", "estribilho", "coro"]
                    if any(p in v_lower for p in palavras_chave):
                        novo_coro = v
                        motivo = f"Palavra-chave encontrada na estrofe {k}"
                        chaves_para_remover = [k]
                        break
            
            # --- APLICAR MUDANÇA ---
            if novo_coro:
                # 1. Define o novo coro
                hino['coro'] = novo_coro
                
                # 2. Remove as estrofes que viraram coro
                for k in chaves_para_remover:
                    if k in hino['verses']:
                        del hino['verses'][k]
                
                # 3. Renumera as estrofes para não ficarem buracos (ex: 1, 3, 5 -> 1, 2, 3)
                novas_verses = {}
                contador = 1
                # Ordena pelas chaves originais para manter a ordem correta
                chaves_ordenadas = sorted(hino['verses'].keys(), key=lambda x: int(x) if x.isdigit() else 99)
                
                for k in chaves_ordenadas:
                    novas_verses[str(contador)] = hino['verses'][k]
                    contador += 1
                
                hino['verses'] = novas_verses
                
                total_corrigidos += 1
                log_mudancas.append(f"Hino {numero}: {motivo}")

    # Salva o novo arquivo
    with open(arquivo_saida, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n--- Processo Concluído ---")
    print(f"Total de hinos corrigidos: {total_corrigidos}")
    print(f"Arquivo salvo como: {arquivo_saida}\n")
    
    # Mostra os primeiros 5 exemplos do que foi feito
    if log_mudancas:
        print("Exemplos de correções:")
        for log in log_mudancas[:5]:
            print(f" -> {log}")

if __name__ == "__main__":
    corrigir_cantor_cristao()