# Sincronizare ClickUp pentru mentorat

## Ce construim

- Un task ClickUp pentru fiecare elev și program, în lista fluxului său: START Flux 1, START Flux 2 sau Business Flux 3.
- Câte un subtask pentru fiecare modul al programului. Descrierea conține exercițiile modulului și răspunsurile elevului, formatate lizibil, nu ca JSON/HTML.
- La salvarea unui răspuns, platforma actualizează automat numai subtaskul modulului afectat. Prima sincronizare creează structura completă; următoarele refolosesc taskul și subtaskurile existente.
- Briefingul salvat apare într-un comentariu al taskului elevului. Regenerarea sau sincronizarea din Admin actualizează același comentariu, fără duplicate și fără regenerare AI automată la fiecare exercițiu.
- Buton „Sincronizează ClickUp” lângă fiecare elev din Admin → Utilizatori, cu rezultat și link către task.
- „Regenerează briefingurile” respectă programul, fluxul și treapta selectate în filtrul „Înainte de apel”.

## Implementare tehnică

- O legătură persistentă elev/program → task, subtaskuri și comentariu, accesibilă numai administratorilor; operațiile ClickUp rulează exclusiv pe server.
- Apelurile folosesc conexiunea ClickUp deja legată la proiect, fără token în browser și fără credite AI pentru sincronizare.
- Formatarea răspunsurilor refolosește titlurile și numerotarea X.Y din conținutul cursului.
- Erorile ClickUp sunt păstrate pe legătura elevului și afișate administratorului; salvarea exercițiului rămâne reușită chiar dacă ClickUp este temporar indisponibil.

## Verificare

- Teste pentru identificarea cursului/modulului, formatarea răspunsurilor și filtrul de regenerare în masă.
- Test real cu elevul `teststart@aa.ro`: task, toate subtaskurile, răspunsuri și comentariu de briefing verificate prin ClickUp.
- Verificare în browser a butonului din Admin și a sincronizării automate după salvarea unui exercițiu.
