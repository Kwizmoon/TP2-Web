import { createApp, ref, computed, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import {
    getTravailId,
    getDisponibilites,
    updateDisponibilites
} from './api.js';

const CLE_MATRICULE = 'matricule';
const CLE_NOM = 'nom';

createApp({
    setup() {
        const travailId = window.TRAVAIL_ID || '';

        const travail = ref(null);
        const creneaux = ref([]);
        const loading = ref(true);
        const error = ref(null);

        // Formulaire étudiant
        const nom = ref('');
        const matricule = ref('');
        const creneauxSelectionnes = ref([]);
        const erreurs = ref({});
        const enCoursEnvoi = ref(false);

        const getIdCreneau = (item) => item?.id ?? item?.id_creneau ?? item?.creneau_id;

        const extraireListeDispos = (data) => {
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.disponibilites)) return data.disponibilites;
            return [];
        };

        const formaterDate = (dateStr) => {
            if (!dateStr) return '';
            return String(dateStr).replace('T', ' ').replace(/\.\d+Z$/, '').replace('Z', '');
        };

        // Fusionne les créneaux et les disponibilités agrégées si elles viennent de deux appels séparés
        const fusionnerCreneauxEtDispos = (listeCreneaux, dispos) => {
            const base = Array.isArray(listeCreneaux) ? listeCreneaux : [];
            const mapDispos = new Map();

            if (Array.isArray(dispos)) {
                for (const item of dispos) {
                    const idCreneau = getIdCreneau(item);
                    if (idCreneau !== undefined) {
                        mapDispos.set(String(idCreneau), item);
                    }
                }
            }

            // Si la liste des créneaux est vide mais que getDisponibilites retourne les créneaux agrégés
            if (base.length === 0 && mapDispos.size > 0) {
                return Array.from(mapDispos.values()).map(d => ({
                    ...d,
                    id: getIdCreneau(d),
                    nombre_eleve: Number(d.nombre_eleve ?? d.nb_etudiants ?? d.count ?? 0),
                    liste_etudiant: d.liste_etudiant ?? d.etudiants ?? d.noms ?? ''
                }));
            }

            return base.map(c => {
                const idCreneau = String(getIdCreneau(c));
                const infoDispo = mapDispos.get(idCreneau) || {};

                return {
                    ...c,
                    id: getIdCreneau(c),
                    nombre_eleve: Number(
                        infoDispo.nombre_eleve ??
                        infoDispo.nb_etudiants ??
                        infoDispo.count ??
                        c.nombre_eleve ??
                        0
                    ),
                    liste_etudiant:
                        infoDispo.liste_etudiant ??
                        infoDispo.etudiants ??
                        infoDispo.noms ??
                        c.liste_etudiant ??
                        ''
                };
            });
        };

        // Coche les créneaux déjà enregistrés pour le matricule courant
        const appliquerCreneauxChoisis = (disposBrutes) => {
            const mat = matricule.value.trim();
            if (!mat) {
                creneauxSelectionnes.value = [];
                return;
            }

            const liste = extraireListeDispos(disposBrutes);
            const lignesEtudiant = liste.filter(
                item => item && item.matricule !== undefined && String(item.matricule).trim() === mat
            );

            const idsChoisis = new Set(
                lignesEtudiant
                    .map(item => item.creneau_id ?? item.id_creneau ?? item.id)
                    .filter(val => val !== undefined && val !== null)
                    .map(val => String(val))
            );

            creneauxSelectionnes.value = creneaux.value
                .map(getIdCreneau)
                .filter(idVal => idVal !== undefined && idsChoisis.has(String(idVal)));
        };

        const chargerDisponibilitesEtudiant = async () => {
            const mat = matricule.value.trim();

            if (!mat || !travailId) {
                creneauxSelectionnes.value = [];
                return;
            }

            try {
                const dataDispos = await getDisponibilites(travailId);
                appliquerCreneauxChoisis(dataDispos);
            } catch (err) {
                console.error('Erreur lors du chargement des disponibilités de l’étudiant :', err);
            }
        };

        const chargerDonnees = async () => {
            loading.value = true;
            error.value = null;

            try {
                const [dataTravail, dataDispos] = await Promise.all([
                    getTravailId(travailId),
                    getDisponibilites(travailId).catch(() => [])
                ]);

                // Gère les deux formats possibles : { travail: {...}, creneaux: [...] } ou objet direct
                travail.value = dataTravail.travail || dataTravail;
                const creneauxBruts = Array.isArray(dataTravail.creneaux)
                    ? dataTravail.creneaux
                    : (Array.isArray(travail.value?.creneaux) ? travail.value.creneaux : []);

                creneaux.value = fusionnerCreneauxEtDispos(creneauxBruts, dataDispos);

                if (matricule.value.trim()) {
                    appliquerCreneauxChoisis(dataDispos);
                }
            } catch (err) {
                error.value = err.message;
            } finally {
                loading.value = false;
            }
        };

        const maxEleves = computed(() => {
            if (creneaux.value.length === 0) return 0;
            return Math.max(...creneaux.value.map(c => Number(c.nombre_eleve) || 0));
        });

        const afficherToastSucces = (message) => {
            if (typeof Swal === 'undefined') return;
            Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                showClass: { popup: '' },
                hideClass: { popup: '' },
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            }).fire({
                icon: 'success',
                title: message
            });
        };

        const validerFormulaire = () => {
            const nouvellesErreurs = {};

            if (!nom.value) {
                nouvellesErreurs.nom = 'Le nom est obligatoire.';
            }

            if (!/^\d{1,20}$/.test(matricule.value)) {
                nouvellesErreurs.matricule = 'Le matricule doit être un numéro (20 caractères max).';
            }

            if (creneauxSelectionnes.value.length === 0) {
                nouvellesErreurs.creneaux = 'Veuillez sélectionner au moins un créneau.';
            }

            erreurs.value = nouvellesErreurs;
            return Object.keys(nouvellesErreurs).length === 0;
        };

        const soumettreDisponibilites = async () => {
            if (!validerFormulaire()) return;

            enCoursEnvoi.value = true;
            try {
                await updateDisponibilites(
                    travailId,
                    matricule.value,
                    nom.value,
                    creneauxSelectionnes.value
                );

                // Persiste matricule et nom uniquement après un enregistrement réussi
                localStorage.setItem(CLE_MATRICULE, matricule.value);
                localStorage.setItem(CLE_NOM, nom.value);

                const message = creneauxSelectionnes.value.length > 1
                    ? 'Vos créneaux ont bien été enregistrés !'
                    : 'Votre créneau a bien été enregistré !';

                afficherToastSucces(message);

                // Recharge les données pour mettre à jour les créneaux et l'état des cases cochées
                await chargerDonnees();
            } catch (err) {
                erreurs.value.global = err.message;
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: err.message
                    });
                }
            } finally {
                enCoursEnvoi.value = false;
            }
        };

        onMounted(async () => {
            const nomEnregistre = localStorage.getItem(CLE_NOM);
            const matriculeEnregistre = localStorage.getItem(CLE_MATRICULE);

            if (nomEnregistre && !nom.value) {
                nom.value = nomEnregistre.trim();
            }
            if (matriculeEnregistre && !matricule.value) {
                matricule.value = matriculeEnregistre.trim();
            }

            await chargerDonnees();
        });

        return {
            travail,
            creneaux,
            loading,
            error,
            nom,
            matricule,
            creneauxSelectionnes,
            erreurs,
            enCoursEnvoi,
            maxEleves,
            formaterDate,
            chargerDisponibilitesEtudiant,
            soumettreDisponibilites
        };
    }
}).mount('#app');