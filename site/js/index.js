// Importation de Vue 3 via CDN 
import { createApp, ref, onMounted, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { getCours, getTravauxOuverts } from './api.js';

createApp({
    setup() {
        // Récupération de la valeur initiale injectée par PHP via l'objet window
        const coursSelectionne = ref(window.COURS_INITIAL || '');

        const listCours = ref([]);
        const travaux = ref([]);
        const loading = ref(true);
        const error = ref(null);

        // Charger la liste des cours et des travaux au démarrage
        onMounted(async () => {
            try {
                listCours.value = await getCours();
                await chargerTravaux();
            } catch (err) {
                error.value = err.message;
            } finally {
                loading.value = false;
            }
        });

        // Fonction pour récupérer les travaux (filtrés par cours si sélectionné)
        const chargerTravaux = async () => {
            try {
                loading.value = true;
                travaux.value = await getTravauxOuverts(coursSelectionne.value);
            } catch (err) {
                error.value = err.message;
            } finally {
                loading.value = false;
            }
        };

        // Fonction pour nettoyer et formater la date (enlève le T et le Z)
        const formaterDate = (dateStr) => {
            if (!dateStr) return '';
            // Remplace le 'T' par un espace et retire les millisecondes et le 'Z' final
            return dateStr.replace('T', ' ').replace(/\.\d+Z$/, '').replace('Z', '');
        };

        // Regrouper les travaux par nom de cours
        const travailParCours = computed(() => {
            const groupe = {};
            travaux.value.forEach(travail => {
                const nomCours = travail.cours_titre;
                if (!groupe[nomCours]) {
                    groupe[nomCours] = [];
                }
                groupe[nomCours].push(travail);
            });
            return groupe;
        });

        return {
            coursSelectionne,
            listCours,
            travaux,
            loading,
            error,
            chargerTravaux,
            travailParCours,
            formaterDate
        };
    }
}).mount('#app');