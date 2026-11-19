import { createApp, ref, reactive, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import {
    connecterAdmin,
    deconnecterAdmin,
    getAdminTravaux,
    updateTravail,
    ajouterCreneau,
    updateCreneau,
    deleteCreneau,
    getTravailId as fetchTravailDetail,
    getDisponibilites
} from './api.js';

const CLE_TOKEN = 'token';

createApp({
    setup() {
        const token = ref(sessionStorage.getItem(CLE_TOKEN) || '');
        const vue = ref(token.value ? 'liste' : 'login');

        const chargement = ref(false);
        const enCoursAction = ref(false);
        const erreurGlobale = ref('');

        // Connexion
        const identifiant = ref('');
        const motDePasse = ref('');
        const erreursLogin = reactive({
            identifiant: '',
            motDePasse: '',
            global: ''
        });

        // Travaux et créneaux
        const travaux = ref([]);
        const travailCourant = ref(null);
        const creneaux = ref([]);

        const formTravail = reactive({
            id: '',
            titre: '',
            type: 'individuel',
            description: '',
            ouvert: false,
            disponible: '',
            remise: ''
        });

        const nouveauCreneau = reactive({
            debut: '',
            fin: ''
        });

        const getTravailId = (item) => item?.id ?? item?.id_travail ?? item?.travail_id ?? '';
        const getCreneauId = (item) => item?.id ?? item?.id_creneau ?? item?.creneau_id ?? '';

        const versBooleen = (valeur) => {
            if (typeof valeur === 'boolean') return valeur;
            if (typeof valeur === 'number') return valeur === 1;
            if (typeof valeur === 'string') {
                const v = valeur.trim().toLowerCase();
                return v === 'true' || v === '1';
            }
            return Boolean(valeur);
        };

        const compterReponses = (creneau) => {
            const val =
                creneau?.nombre_reponses ??
                creneau?.nb_reponses ??
                creneau?.reponses_count ??
                creneau?.nombre_eleve ??
                creneau?.nb_etudiants ??
                0;
            const num = Number(val);
            return Number.isFinite(num) && num > 0 ? num : 0;
        };

        const formaterDateInput = (dateStr) => {
            if (!dateStr) return '';
            return String(dateStr).trim().replace(' ', 'T').slice(0, 16);
        };

        const notifier = (icon, title, text = '') => {
            if (typeof Swal !== 'undefined') {
                return Swal.fire({ icon, title, text });
            }
            alert(text ? `${title}\n${text}` : title);
            return Promise.resolve({ isConfirmed: true });
        };

        const nettoyerSessionLocale = () => {
            sessionStorage.removeItem(CLE_TOKEN);
            token.value = '';
            travaux.value = [];
            travailCourant.value = null;
            creneaux.value = [];
            identifiant.value = '';
            motDePasse.value = '';
            vue.value = 'login';
        };

        const gererErreurAuth = (err) => {
            const msg = String(err?.message || '').toLowerCase();
            if (msg.includes('401') || msg.includes('token') || msg.includes('non autoris') || msg.includes('expir')) {
                nettoyerSessionLocale();
                erreursLogin.global = err.message || 'Session expirée. Veuillez vous reconnecter.';
                return true;
            }
            return false;
        };

        // VUE 1 : Connexion
        const seConnecter = async () => {
            erreursLogin.identifiant = '';
            erreursLogin.motDePasse = '';
            erreursLogin.global = '';

            if (!identifiant.value) {
                erreursLogin.identifiant = "L'identifiant est obligatoire.";
            }
            if (!motDePasse.value) {
                erreursLogin.motDePasse = 'Le mot de passe est obligatoire.';
            }
            if (erreursLogin.identifiant || erreursLogin.motDePasse) {
                return;
            }

            chargement.value = true;
            try {
                const data = await connecterAdmin(identifiant.value, motDePasse.value);
                const recuToken = data?.token || data?.jeton || data?.access_token || '';

                if (!recuToken) {
                    erreursLogin.global = data?.message || data?.error || 'Jeton non reçu lors de la connexion.';
                    return;
                }

                sessionStorage.setItem(CLE_TOKEN, recuToken);
                token.value = recuToken;
                motDePasse.value = '';
                vue.value = 'liste';
                await chargerTravaux();
            } catch (err) {
                erreursLogin.global = err.message || 'Identifiants invalides.';
            } finally {
                chargement.value = false;
            }
        };

        // Déconnexion
        const seDeconnecter = async () => {
            const currentToken = token.value;
            enCoursAction.value = true;
            try {
                if (currentToken) {
                    await deconnecterAdmin(currentToken);
                }
            } catch {
                // On nettoie la session locale même si le token est déjà invalide côté serveur
            } finally {
                enCoursAction.value = false;
                nettoyerSessionLocale();
            }
        };

        // VUE 2 : Liste des travaux de l'admin
        const chargerTravaux = async () => {
            if (!token.value) {
                vue.value = 'login';
                return;
            }

            chargement.value = true;
            erreurGlobale.value = '';
            try {
                const data = await getAdminTravaux(token.value);
                const liste = Array.isArray(data)
                    ? data
                    : (Array.isArray(data?.travaux) ? data.travaux : []);
                travaux.value = liste;
            } catch (err) {
                if (!gererErreurAuth(err)) {
                    erreurGlobale.value = err.message || 'Impossible de charger les travaux.';
                }
            } finally {
                chargement.value = false;
            }
        };

        // Prépare les données d'un travail et de ses créneaux pour la vue détail
        const hydraterDetailTravail = (idFallback, dataTravail, dataDispos = []) => {
            const detail = dataTravail?.travail || dataTravail || {};
            travailCourant.value = detail;

            formTravail.id = getTravailId(detail) || idFallback;
            formTravail.titre = detail.titre || detail.travail_titre || '';
            formTravail.type = ['individuel', 'equipe'].includes(detail.type)
                ? detail.type
                : 'individuel';
            formTravail.description = detail.description || '';
            formTravail.ouvert = versBooleen(detail.ouvert);
            formTravail.remise = formaterDateInput(detail.remise);
            formTravail.disponible = formaterDateInput(detail.disponible);

            const listeBrute = Array.isArray(dataTravail?.creneaux)
                ? dataTravail.creneaux
                : (Array.isArray(detail?.creneaux) ? detail.creneaux : []);

            const mapDispos = new Map();
            if (Array.isArray(dataDispos)) {
                for (const item of dataDispos) {
                    const idC = item?.creneau_id ?? item?.id_creneau ?? item?.id;
                    if (idC !== undefined) {
                        mapDispos.set(String(idC), item);
                    }
                }
            }

            const baseCreneaux = listeBrute.length > 0
                ? listeBrute
                : Array.from(mapDispos.values());

            creneaux.value = baseCreneaux.map((c) => {
                const idC = String(getCreneauId(c));
                const infoDispo = mapDispos.get(idC) || {};
                const fusion = { ...c, ...infoDispo };

                return {
                    ...fusion,
                    id: getCreneauId(fusion),
                    debutEdit: formaterDateInput(fusion.debut),
                    finEdit: formaterDateInput(fusion.fin)
                };
            });
        };

        // VUE 3 : Ouverture d'un travail cliqué
        const ouvrirTravail = async (item) => {
            const id = getTravailId(item);
            if (!id || !token.value) return;

            vue.value = 'detail';
            chargement.value = true;
            erreurGlobale.value = '';
            travailCourant.value = null;
            creneaux.value = [];

            try {
                let dataTravail = item;
                if (typeof fetchTravailDetail === 'function') {
                    try {
                        dataTravail = await fetchTravailDetail(id);
                    } catch {
                        dataTravail = item;
                    }
                }

                let dataDispos = [];
                if (typeof getDisponibilites === 'function') {
                    try {
                        dataDispos = await getDisponibilites(id);
                    } catch {
                        dataDispos = [];
                    }
                }

                hydraterDetailTravail(id, dataTravail, dataDispos);
            } catch (err) {
                if (!gererErreurAuth(err)) {
                    erreurGlobale.value = err.message || 'Impossible de charger les détails du travail.';
                }
            } finally {
                chargement.value = false;
            }
        };

        const retourListe = async () => {
            vue.value = 'liste';
            travailCourant.value = null;
            creneaux.value = [];
            await chargerTravaux();
        };

        // Modifier un travail
        const enregistrerTravail = async () => {
            const titreValide = String(formTravail.titre || '').trim();
            const descriptionValide = String(formTravail.description || '').trim();
            const ouvertValide = Boolean(formTravail.ouvert);

            if (!titreValide || titreValide.length > 150) {
                await notifier('warning', 'Titre invalide', 'Le titre est requis (max 150 caractères).');
                return;
            }
            if (!descriptionValide) {
                await notifier('warning', 'Description invalide', 'La description est requise.');
                return;
            }
            if (!['individuel', 'equipe'].includes(formTravail.type)) {
                await notifier('warning', 'Type invalide', "Le type doit être 'individuel' ou 'equipe'.");
                return;
            }

            enCoursAction.value = true;
            try {
                const payload = {
                    titre: titreValide,
                    type: formTravail.type,
                    description: descriptionValide,
                    ouvert: ouvertValide,
                    disponible: formTravail.disponible,
                    remise: formTravail.remise 
                };

                await updateTravail(token.value, formTravail.id, payload);
                travailCourant.value = { ...travailCourant.value, ...payload };
                await notifier('success', 'Travail modifié');
            } catch (err) {
                if (!gererErreurAuth(err)) {
                    await notifier('error', 'Erreur', err.message || 'Échec de la modification du travail.');
                }
            } finally {
                enCoursAction.value = false;
            }
        };

        // Ajouter un créneau au travail
        const ajouterNouveauCreneau = async () => {
            if (!nouveauCreneau.debut || !nouveauCreneau.fin) {
                await notifier('warning', 'Heures manquantes', 'Veuillez renseigner le début et la fin du créneau.');
                return;
            }
            if (nouveauCreneau.fin <= nouveauCreneau.debut) {
                await notifier('warning', 'Plage horaire invalide', 'La fin doit être après le début.');
                return;
            }

            enCoursAction.value = true;
            try {
                await ajouterCreneau(token.value, formTravail.id, nouveauCreneau.debut, nouveauCreneau.fin);
                nouveauCreneau.debut = '';
                nouveauCreneau.fin = '';
                await notifier('success', 'Créneau ajouté');
                await ouvrirTravail({ id: formTravail.id });
            } catch (err) {
                if (!gererErreurAuth(err)) {
                    await notifier('error', 'Erreur', err.message || "Impossible d'ajouter le créneau.");
                }
            } finally {
                enCoursAction.value = false;
            }
        };

        // Modifier les heures d'un créneau
        const modifierHeuresCreneau = async (creneau) => {
            const idCreneau = getCreneauId(creneau);
            if (!creneau.debutEdit || !creneau.finEdit) {
                await notifier('warning', 'Heures manquantes', 'Veuillez renseigner le début et la fin.');
                return;
            }
            if (creneau.finEdit <= creneau.debutEdit) {
                await notifier('warning', 'Plage horaire invalide', 'La fin doit être après le début.');
                return;
            }

            enCoursAction.value = true;
            try {
                await updateCreneau(token.value, idCreneau, creneau.debutEdit, creneau.finEdit);
                creneau.debut = creneau.debutEdit;
                creneau.fin = creneau.finEdit;
                await notifier('success', 'Heures du créneau mises à jour');
            } catch (err) {
                if (!gererErreurAuth(err)) {
                    await notifier('error', 'Erreur', err.message || 'Impossible de modifier le créneau.');
                }
            } finally {
                enCoursAction.value = false;
            }
        };

        // Supprimer un créneau après confirmation indiquant le nombre de réponses
        const confirmerEtSupprimerCreneau = async (creneau) => {
            const nb = compterReponses(creneau);
            const message = `Ce créneau a ${nb} ${nb === 1 ? 'réponse' : 'réponses'}. Elles seront supprimées. Continuer ?`;

            let confirme = false;
            if (typeof Swal !== 'undefined') {
                const res = await Swal.fire({
                    icon: 'warning',
                    title: 'Confirmation',
                    text: message,
                    showCancelButton: true,
                    confirmButtonText: 'Continuer',
                    cancelButtonText: 'Annuler'
                });
                confirme = Boolean(res.isConfirmed);
            } else {
                confirme = window.confirm(message);
            }

            if (!confirme) return;

            const idCreneau = getCreneauId(creneau);
            enCoursAction.value = true;
            try {
                await deleteCreneau(token.value, idCreneau);
                creneaux.value = creneaux.value.filter((c) => getCreneauId(c) !== idCreneau);
                await notifier('success', 'Créneau supprimé');
            } catch (err) {
                if (!gererErreurAuth(err)) {
                    await notifier('error', 'Erreur', err.message || 'Impossible de supprimer le créneau.');
                }
            } finally {
                enCoursAction.value = false;
            }
        };

        onMounted(() => {
            if (token.value) {
                vue.value = 'liste';
                chargerTravaux();
            } else {
                vue.value = 'login';
            }
        });

        return {
            vue,
            chargement,
            enCoursAction,
            erreurGlobale,
            identifiant,
            motDePasse,
            erreursLogin,
            travaux,
            travailCourant,
            creneaux,
            formTravail,
            nouveauCreneau,
            getTravailId,
            getCreneauId,
            compterReponses,
            formaterDateInput,
            seConnecter,
            seDeconnecter,
            chargerTravaux,
            ouvrirTravail,
            retourListe,
            enregistrerTravail,
            ajouterNouveauCreneau,
            modifierHeuresCreneau,
            confirmerEtSupprimerCreneau
        };
    }
}).mount('#app');