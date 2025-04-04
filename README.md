EXPLICATII 

Index.js citește lista de site-uri dintr-un fișier Parquet folosind funcția din readfile.js și inițiază procesul de obținere a logo-urilor.
Pentru fiecare site, se apelează funcția scrapeLogo din scrapper.js pentru a extrage URL-ul logo-ului. Dacă logo-ul este găsit,
este procesat prin funcția preprocessLogo din preprocess.js, care îl redimensionează și îl convertește în alb-negru pentru a-l standardiza.
După ce toate logo-urile sunt procesate, acestea sunt trimise la clusterLogos din cluster.js, care le grupează în funcție de similitudine.
În final, index.js returnează un set de clustere de logo-uri similare, care sunt afișate în consolă.

În scrapper.js, avem logica de extragere a logo-urilor. Folosim Puppeteer pentru a lansa un browser headless, care deschide site-ul și caută toate
tag-urile <img> care conțin cuvinte cheie precum „logo” sau „brand” în atributele alt, class sau src.
Dacă găsește o imagine care se potrivește, returnează URL-ul acesteia. Există, de asemenea, o verificare pentru a valida URL-ul site-ului,
corectându-l pentru a începe cu http sau https dacă este necesar.

În preprocess.js, procesăm imaginea logo-ului obținută. După ce obținem URL-ul, verificăm validitatea acestuia și descărcăm imaginea folosind axios.
Apoi, procesăm imaginea utilizând biblioteca Sharp: o redimensionăm la dimensiunea de 100x100 pixeli și o transformăm într-o imagine alb-negru (grayscale).
Acest lucru standardizează logo-urile, făcându-le comparabile. În final, logo-ul procesat este returnat ca un buffer de imagine, care va fi folosit mai târziu pentru comparațiile dintre logo-uri.

În compare.js, se află logica de comparare a logo-urilor. Aici, comparăm două logo-uri pixel cu pixel.
Dacă există pixeli comuni între cele două imagini, numărăm câți dintre aceștia se potrivesc și calculăm un scor de similitudine.
Acest scor reprezintă raportul dintre numărul de pixeli comuni și numărul total de pixeli, având o valoare între 0 și 1, unde 1 indică logo-uri identice și 0 semnifică că logo-urile nu au nicio asemănare.

În cluster.js, gestionăm logica de grupare a logo-urilor. Pentru fiecare logo procesat, îl comparăm cu logo-urile deja existente în clusterele existente.
Dacă găsim un logo suficient de similar cu unul dintr-un cluster (adică scorul de similitudine depășește pragul definit, de exemplu 0.8), adăugăm logo-ul respectiv în acel cluster.
Dacă nu găsim un cluster corespunzător, creăm unul nou pentru acel logo. În final, returnăm toate clusterele sub formă de liste de logo-uri similare.

În readfile.js, lista de site-uri este citită dintr-un fișier Parquet.
Verificăm dacă fișierul există, afișând un mesaj de eroare dacă lipsește. Biblioteca parquetjs-lite este folosită pentru a deschide fișierul Parquet și pentru a extrage fiecare rând.
Domeniul site-ului (record.domain) este extras din fiecare rând și adăugat într-o listă de site-uri. Această listă este utilizată în pașii ulteriori de extragere și procesare a logo-urilor.

Pe scurt index.js, citeste site-urile din fișierul Parquet.
Fiecare site este apoi procesat în scrapper.js pentru a extrage logo-ul, care este procesat mai departe în preprocess.js.
Logo-urile procesate sunt comparate în compare.js și, în final, sunt grupate în clustere de logo-uri similare în cluster.js.
Fiecare fișier are un rol distinct și poate fi extins sau modificat cu ușurință pentru a adăuga noi funcționalități, dacă este necesar.
