
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { trailersRepo } from '../repositories/trailersRepo';
import { Status } from '../types';
import { useToast } from '../components/ToastContext';

export const CreateTrailer: React.FC = () => {
    const navigate = useNavigate();
    const { id: routeId } = useParams();
    const [searchParams] = useSearchParams();
    const queryId = searchParams.get('id');
    const trailerId = routeId || queryId;

    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        plate: '',
        type: '',
        capacity_kg: '',
        status: Status.Active,
    });

    useEffect(() => {
        if (trailerId) {
            const fetchTrailer = async () => {
                setLoading(true);
                try {
                    const trailer = await trailersRepo.getTrailerById(trailerId);
                    if (trailer) {
                        setFormData({
                            plate: trailer.plate,
                            type: trailer.type,
                            capacity_kg: trailer.capacity_kg?.toString() || '',
                            status: trailer.status as Status,
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch trailer:', err);
                    showToast('Erro ao carregar dados do reboque.', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchTrailer();
        }
    }, [trailerId, showToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.plate || !formData.type) {
            setError('Matrícula e tipo são obrigatórios');
            return;
        }

        setLoading(true);
        try {
            const trailerData = {
                plate: formData.plate.toUpperCase(),
                type: formData.type,
                capacity_kg: formData.capacity_kg ? parseInt(formData.capacity_kg) : undefined,
                status: formData.status,
            };

            if (trailerId) {
                await trailersRepo.updateTrailer(trailerId, trailerData);
                showToast('✅ Reboque atualizado com sucesso!', 'success');
            } else {
                await trailersRepo.createTrailer(trailerData);
                showToast('✅ Reboque registado com sucesso!', 'success');
            }

            navigate('/trailers');
        } catch (err: any) {
            console.error('Failed to save trailer:', err);
            setError(err.message || 'Erro ao salvar reboque. Tente novamente.');
            showToast('Erro ao salvar reboque.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm text-txt-tertiary mb-2">
                <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/')}>Dashboard</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/trailers')}>Reboques</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-txt-primary">{trailerId ? 'Editar Reboque' : 'Adicionar Reboque'}</span>
            </div>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-txt-primary">{trailerId ? 'Editar Reboque' : 'Registar Novo Reboque'}</h1>
            </div>

            <div className="max-w-3xl">
                <form onSubmit={handleSubmit} className="bg-surface-1 border border-surface-border rounded-xl p-6 space-y-8">

                    {/* Trailer Identity Section */}
                    <div>
                        <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-primary">local_shipping</span>
                            Identificação do Reboque
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-txt-secondary">Matrícula</label>
                                <input
                                    name="plate"
                                    value={formData.plate}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="EX: REB-1234"
                                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary uppercase"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-txt-secondary">Tipo</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Bau">Baú</option>
                                    <option value="Sider">Sider</option>
                                    <option value="Frigorifico">Frigorífico</option>
                                    <option value="Prancha">Prancha</option>
                                    <option value="Graneleiro">Graneleiro</option>
                                    <option value="Tanque">Tanque</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-txt-secondary">Capacidade (kg)</label>
                                <input
                                    name="capacity_kg"
                                    value={formData.capacity_kg}
                                    onChange={handleChange}
                                    type="number"
                                    placeholder="EX: 25000"
                                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-txt-secondary">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                                >
                                    <option value={Status.Active}>Ativo</option>
                                    <option value={Status.Inactive}>Inativo</option>
                                    <option value={Status.Error}>Em Manutenção</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg text-semantic-error text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/trailers')}
                            disabled={loading}
                            className="px-6 py-2.5 rounded-lg border border-surface-border text-txt-primary hover:bg-surface-2 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-lg bg-brand-primary text-bg-main font-bold hover:bg-brand-hover transition-colors text-sm shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'A guardar...' : (trailerId ? 'Atualizar Reboque' : 'Guardar Reboque')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
